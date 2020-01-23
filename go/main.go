package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"

	"github.com/ReturnPath/story-points/service"
	"github.com/ReturnPath/story-points/store"
)

func main() {
	var port string
	flag.StringVar(&port, "port", ":8081", "Port on which to host server")
	flag.Parse()

	dbConf := store.DBConf{
		User:     os.Getenv("SPUSER"),
		Name:     os.Getenv("SPDB"),
		Host:     os.Getenv("SPHOST"),
		Password: os.Getenv("SPPASSWORD"),
		Port:     os.Getenv("SPPORT"),
	}

	dstore, err := store.New(dbConf)
	if err != nil {
		log.Fatal("could not create store:", err)
	}
	svc := service.New(dstore)
	//mux := http.NewServeMux()
	router := mux.NewRouter()

	//static := http.FileServer(http.Dir("../dist/story-points"))

	router.HandleFunc("/socket", svc.Connect)
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path, err := filepath.Abs(r.URL.Path)
		if err != nil {
			// if we failed to get the absolute path respond with a 400 bad request
			// and stop
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// prepend the path with the path to the static directory
		path = filepath.Join("../dist/story-points", path)

		// check whether a file exists at the given path
		_, err = os.Stat(path)
		if os.IsNotExist(err) {
			// file does not exist, serve index.html
			http.ServeFile(w, r, filepath.Join("../dist/story-points", "index.html"))
			return
		} else if err != nil {
			// if we got an error (that wasn't that the file doesn't exist) stating the
			// file, return a 500 internal server error and stop
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// otherwise, use http.FileServer to serve the static dir
		http.FileServer(http.Dir("../dist/story-points")).ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:         port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Fatal(server.ListenAndServe())
}
