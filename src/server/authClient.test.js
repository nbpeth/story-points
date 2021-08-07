const authClient = require("./authClient");
const jwt = require('jsonwebtoken');
const axios = require('axios');

jest.mock("jsonwebtoken");
jest.mock('axios');

describe("AuthClient", () => {
  const token = "dingus";
  const authHeader = `Bearer ${token}`;

  describe("generateJWT", () => {

  });

  describe("validateIdToken", () => {
    it("must return null if jwt is not verifiable", () => {
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error("booooo bad token")
      })

      authClient.validateIdToken(authHeader)
        .then((res) => {
          expect(res).toBeNull();
        }).catch(e => {
        throw Error(`Should not have errored: ${e}`);
      });
    });

    it("must return user info if token verified", () => {
      const expected = {user: "information"}
      jwt.verify = jest.fn().mockImplementation(() => {
        return expected
      })

      authClient.validateIdToken(authHeader)
        .then((res) => {
          expect(res).toEqual(expected)
        }).catch(e => {
        throw Error(`Should not have errored: ${e}`);
      });
    });
  });

  describe("validateAccessToken", () => {
    it("must throw error if response non 200 (rejected)", () => {
      axios.get = jest.fn().mockImplementation(() => {
        return Promise.reject("No one came to your birthday party.")
      });

      authClient.validateAccessToken(authHeader)
        .then(_ => {
          throw Error("Should have failed");
        })
        .catch(e => {
          expect(e).toEqual(`Invalid user. Auth header: , "${authHeader}"`)
        })
    });

    it("must return response if request not rejected", () => {
      const expected = {cats: "have tails"};
      axios.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(expected);
      });

      authClient.validateAccessToken(authHeader)
        .then(response => {
          expect(response).toEqual(expected)
        })
        .catch(e => {
          console.error(e)
          throw Error("Should not have failed");
        });
    });
  });

  describe("stripTokenFromAuthHeader", () => {
    it("must remove token from Bearer token auth header", () => {
      const expected = token;

      const result = authClient.stripTokenFromAuthHeader(authHeader);

      expect(result).toEqual(expected);
    });

    it("returns empty string if Bearer is missing from header", () => {
      const expected = "";
      const authHeader = `${expected}`

      const result = authClient.stripTokenFromAuthHeader(authHeader);

      expect(result).toEqual(expected);
    });
  })
});
