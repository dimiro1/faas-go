/**
 * @fileoverview Function creation view with template selection.
 */

import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { BackButton, Button, ButtonVariant } from "../components/button.js";
import {
  FormGroup,
  FormHelp,
  FormInput,
  FormLabel,
  FormTextarea,
} from "../components/form.js";
import {
  FunctionTemplates,
  TemplateCard,
  TemplateCards,
} from "../components/template-card.js";

/**
 * @typedef {Object} FormData
 * @property {string} name - Function name
 * @property {string} description - Function description
 * @property {string} code - Initial function code
 */

/**
 * @typedef {Object} ParsedError
 * @property {string} field - Field name that has the error
 * @property {string} message - Error message
 */

/**
 * Function creation view component.
 * Allows creating new functions with template selection.
 * @type {Object}
 */
export const FunctionCreate = {
  /**
   * Form data state.
   * @type {FormData}
   */
  formData: {
    name: "",
    description: "",
    code: "",
  },

  /**
   * Field-specific errors.
   * @type {Object.<string, string>}
   */
  errors: {},

  /**
   * Currently selected template ID.
   * @type {string}
   */
  selectedTemplate: "http",

  /**
   * Initializes the view and resets form state.
   */
  oninit: () => {
    FunctionCreate.formData = {
      name: "",
      description: "",
      code: "",
    };
    FunctionCreate.errors = {};
    FunctionCreate.selectedTemplate = "http";
    // Set initial code from default template
    const template = FunctionTemplates.find((t) => t.id === "http");
    if (template) {
      FunctionCreate.formData.code = template.code;
    }
  },

  /**
   * Selects a template and updates the code.
   * @param {string} templateId - Template ID to select
   */
  selectTemplate: (templateId) => {
    FunctionCreate.selectedTemplate = templateId;
    const template = FunctionTemplates.find((t) => t.id === templateId);
    if (template) {
      FunctionCreate.formData.code = template.code;
    }
  },

  /**
   * Parses an error message into field and message.
   * @param {string} message - Error message in "field: message" format
   * @returns {ParsedError|null} Parsed error or null if format doesn't match
   */
  parseErrorMessage: (message) => {
    const match = message.match(/^(\w+):\s*(.+)$/);
    if (match) {
      return { field: match[1], message: match[2] };
    }
    return null;
  },

  /**
   * Creates a new function via the API.
   * @returns {Promise<void>}
   */
  createFunction: async () => {
    FunctionCreate.errors = {};
    try {
      const payload = {
        name: FunctionCreate.formData.name,
        description: FunctionCreate.formData.description,
        code: FunctionCreate.formData.code,
      };

      await API.functions.create(payload);
      m.route.set("/functions");
    } catch (e) {
      const error = FunctionCreate.parseErrorMessage(e.message);
      if (error) {
        FunctionCreate.errors[error.field] = error.message;
        m.redraw();
      } else {
        Toast.show("Failed to create function: " + e.message, "error");
      }
    }
  },

  /**
   * Renders the function creation view.
   * @returns {Object} Mithril vnode
   */
  view: () => {
    return m(".create-function-page.fade-in", [
      m(".create-function-header", [
        m(".create-function-back", [m(BackButton, { href: "#!/functions" })]),
        m("h1.create-function-title", "Create New Function"),
        m(
          "p.create-function-subtitle",
          "Initialize a new serverless function using Lua.",
        ),
      ]),

      m(".create-function-form", [
        // Function Name
        m(FormGroup, [
          m(FormLabel, { text: "Function Name", for: "function-name" }),
          m(FormInput, {
            id: "function-name",
            placeholder: "e.g., payment-webhook",
            value: FunctionCreate.formData.name,
            error: !!FunctionCreate.errors.name,
            mono: true,
            oninput: (e) => {
              FunctionCreate.formData.name = e.target.value;
              delete FunctionCreate.errors.name;
            },
          }),
          FunctionCreate.errors.name &&
          m(FormHelp, { error: true, text: FunctionCreate.errors.name }),
        ]),

        // Starter Template
        m(FormGroup, [
          m(FormLabel, { text: "Starter Template" }),
          m(
            TemplateCards,
            FunctionTemplates.map((template) =>
              m(TemplateCard, {
                key: template.id,
                name: template.name,
                description: template.description,
                icon: template.icon,
                selected: FunctionCreate.selectedTemplate === template.id,
                onclick: () => FunctionCreate.selectTemplate(template.id),
              })
            ),
          ),
        ]),

        // Actions
        m(".create-function-actions", [
          m(
            Button,
            {
              variant: ButtonVariant.GHOST,
              href: "#!/functions",
            },
            "Cancel",
          ),
          m(
            Button,
            {
              variant: ButtonVariant.PRIMARY,
              onclick: FunctionCreate.createFunction,
            },
            "Create Function",
          ),
        ]),
      ]),
    ]);
  },
};
