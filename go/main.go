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
	flag.StringVar(&port, "port", ":8081", "port on which to host server")
	flag.Parse()

	//dbConf := store.DBConf{
	//	User:     os.Getenv("SPUSER"),
	//	Name:     os.Getenv("SPDB"),
	//	Host:     os.Getenv("SPHOST"),
	//	Password: os.Getenv("SPPASSWORD"),
	//	Port:     os.Getenv("SPPORT"),
	//}
  dbConf := store.DBConf{
    User:     "user",
    Name:     "storypoints",
    Host:     "localhost",
    Password: "password",
    Port:     "3306",
  }

	dstore, err := store.New(dbConf)
	if err != nil {
		log.Fatal("could not create store: ", err)
	}

	svc := service.New(dstore)
	router := mux.NewRouter()

	router.HandleFunc("/socket", svc.Connect)
	router.HandleFunc("/health", svc.Health)
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path, err := filepath.Abs(r.URL.Path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		path = filepath.Join("../dist/story-points", path)

		_, err = os.Stat(path)
		if os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join("../dist/story-points", "index.html"))
			return
		} else if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		http.FileServer(http.Dir("../dist/story-points")).ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:         port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Println("Listening...")
	log.Fatal(server.ListenAndServe())
}
