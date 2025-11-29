/**
 * @fileoverview Login view for API key authentication.
 */

import { API } from "../api.js";
import { Button, ButtonVariant } from "../components/button.js";
import { Card, CardContent } from "../components/card.js";
import {
  FormGroup,
  FormHelp,
  FormLabel,
  PasswordInput,
} from "../components/form.js";

/**
 * Login view component.
 * Handles API key authentication and redirects to functions list on success.
 * @type {Object}
 */
export const Login = {
  /**
   * Current API key input value.
   * @type {string}
   */
  apiKey: "",

  /**
   * Error message to display.
   * @type {string}
   */
  error: "",

  /**
   * Whether login is in progress.
   * @type {boolean}
   */
  loading: false,

  /**
   * Handles form submission for login.
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
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

  /**
   * Renders the login view.
   * @returns {Object} Mithril vnode
   */
  view: () => {
    return m(".login-container", [
      m(".login-card", [
        m(Card, [
          m(CardContent, { large: true }, [
            m(".login-header", [
              m("h1.login-title", "Lunar"),
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
