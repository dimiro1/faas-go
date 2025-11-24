import { API } from "../api.js";
import { Toast } from "../components/toast.js";
import { Button, ButtonVariant, BackButton } from "../components/button.js";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormHelp,
} from "../components/form.js";
import {
  TemplateCard,
  TemplateCards,
  FunctionTemplates,
} from "../components/template-card.js";

export const FunctionCreate = {
  formData: {
    name: "",
    description: "",
    code: "",
  },
  errors: {},
  selectedTemplate: "http",

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

  selectTemplate: (templateId) => {
    FunctionCreate.selectedTemplate = templateId;
    const template = FunctionTemplates.find((t) => t.id === templateId);
    if (template) {
      FunctionCreate.formData.code = template.code;
    }
  },

  parseErrorMessage: (message) => {
    const match = message.match(/^(\w+):\s*(.+)$/);
    if (match) {
      return { field: match[1], message: match[2] };
    }
    return null;
  },

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
              }),
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
