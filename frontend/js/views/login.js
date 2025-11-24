import { API } from "../api.js";
import { Button, ButtonVariant } from "../components/button.js";
import { Card, CardContent } from "../components/card.js";
import {
  FormGroup,
  FormLabel,
  PasswordInput,
  FormHelp,
} from "../components/form.js";

export const Login = {
  apiKey: "",
  error: "",
  loading: false,

  handleSubmit: async (e) => {
    e.preventDefault();
    Login.error = "";
    Login.loading = true;

    try {
      await API.auth.login(Login.apiKey);
      m.route.set("/functions");
    } catch (err) {
      if (err.error) {
        Login.error = err.error;
      } else if (err.message) {
        Login.error = err.message;
      } else if (typeof err === "string") {
        Login.error = err;
      } else {
        Login.error = "Invalid API key";
      }
    } finally {
      Login.loading = false;
      m.redraw();
    }
  },

  view: () => {
    return m(".login-container", [
      m(".login-card", [
        m(Card, [
          m(CardContent, { large: true }, [
            m(".login-header", [
              m("h1.login-title", "FaaS-Go"),
              m("p.login-subtitle", "Enter your API key to continue"),
            ]),

            m(
              "form",
              {
                onsubmit: Login.handleSubmit,
              },
              [
                m(FormGroup, [
                  m(FormLabel, {
                    for: "api-key",
                    text: "API Key",
                    required: true,
                  }),
                  m(PasswordInput, {
                    id: "api-key",
                    placeholder: "Enter your API key",
                    value: Login.apiKey,
                    required: true,
                    error: Login.error !== "",
                    disabled: Login.loading,
                    oninput: (e) => {
                      Login.apiKey = e.target.value;
                    },
                  }),
                ]),

                Login.error &&
                  m(FormHelp, {
                    text: Login.error,
                    error: true,
                  }),

                m(
                  Button,
                  {
                    variant: ButtonVariant.PRIMARY,
                    type: "submit",
                    fullWidth: true,
                    disabled: Login.loading || !Login.apiKey,
                    loading: Login.loading,
                  },
                  Login.loading ? "Logging in..." : "Login",
                ),
              ],
            ),

            m(
              "p.login-footer",
              "Check the server logs for your API key if this is the first run.",
            ),
          ]),
        ]),
      ]),
    ]);
  },
};
