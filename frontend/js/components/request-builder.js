import { Button, ButtonVariant } from "./button.js";
import { Card, CardHeader, CardContent } from "./card.js";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  CopyInput,
} from "./form.js";

// Request builder component for testing functions
export const RequestBuilder = {
  view(vnode) {
    const {
      url = "",
      method = "GET",
      query = "",
      headers = '{"Content-Type": "application/json"}',
      body = "",
      onMethodChange,
      onQueryChange,
      onHeadersChange,
      onBodyChange,
      onExecute,
      loading = false,
    } = vnode.attrs;

    const methods = [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
      { value: "PATCH", label: "PATCH" },
    ];

    return m(Card, [
      m(CardHeader, { title: "Request Builder" }),
      m(CardContent, [
        // URL display with method selector
        m(".request-builder__url", [
          m(FormSelect, {
            options: methods,
            selected: method,
            onchange: (e) => onMethodChange && onMethodChange(e.target.value),
          }),
          m(CopyInput, {
            value: url + (query ? `?${query}` : ""),
            mono: true,
          }),
        ]),

        // Query params
        m(FormGroup, [
          m(FormLabel, { text: "Query Params" }),
          m(FormInput, {
            value: query,
            placeholder: "key=value&other=value",
            mono: true,
            oninput: (e) => onQueryChange && onQueryChange(e.target.value),
          }),
        ]),

        // Headers
        m(FormGroup, [
          m(FormLabel, { text: "Headers (JSON)" }),
          m(FormTextarea, {
            value: headers,
            rows: 2,
            mono: true,
            oninput: (e) => onHeadersChange && onHeadersChange(e.target.value),
          }),
        ]),

        // Body
        m(FormGroup, [
          m(FormLabel, { text: "Body" }),
          m(FormTextarea, {
            value: body,
            rows: 4,
            mono: true,
            oninput: (e) => onBodyChange && onBodyChange(e.target.value),
          }),
        ]),

        // Execute button
        m(
          Button,
          {
            variant: ButtonVariant.PRIMARY,
            icon: "play",
            fullWidth: true,
            onclick: onExecute,
            disabled: loading,
            loading: loading,
          },
          loading ? "Sending..." : "Send Request",
        ),
      ]),
    ]);
  },
};

// Generate code examples for different languages
export function generateCodeExamples(url, method, query, headers, body) {
  const fullUrl = url + (query ? `?${query}` : "");
  const hasBody = body && ["POST", "PUT", "PATCH"].includes(method);

  let headersList = [];
  try {
    if (headers && headers.trim()) {
      headersList = Object.entries(JSON.parse(headers)).map(([k, v]) => ({
        key: k,
        value: String(v),
      }));
    }
  } catch (e) {}

  // cURL
  let curl = `curl -X ${method}`;
  headersList.forEach((h) => (curl += ` \\\n  -H '${h.key}: ${h.value}'`));
  if (hasBody) curl += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
  curl += ` \\\n  '${fullUrl}'`;

  // JavaScript
  let js =
    headersList.length || hasBody
      ? `const response = await fetch('${fullUrl}', {\n  method: '${method}',\n`
      : `const response = await fetch('${fullUrl}');\n\n`;
  if (headersList.length || hasBody) {
    if (headersList.length) {
      js += `  headers: {\n${headersList.map((h) => `    '${h.key}': '${h.value}'`).join(",\n")}\n  },\n`;
    }
    if (hasBody) {
      js += `  body: '${body.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'\n`;
    }
    js += `});\n\n`;
  }
  js += `const data = await response.json();\nconsole.log(data);`;

  // Python
  let py = `import requests\n\n`;
  if (headersList.length) {
    py += `headers = {\n${headersList.map((h) => `    '${h.key}': '${h.value}'`).join(",\n")}\n}\n\n`;
  }
  py += `response = requests.${method.toLowerCase()}(\n    '${fullUrl}'`;
  if (headersList.length) py += `,\n    headers=headers`;
  if (hasBody) py += `,\n    data='${body.replace(/'/g, "\\'")}'`;
  py += `\n)\n\nprint(response.json())`;

  // Go
  let go = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"`;
  if (hasBody) go += `\n\t"strings"`;
  go += `\n)\n\nfunc main() {\n`;
  if (hasBody) {
    go += `\tbody := strings.NewReader("${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}")\n`;
    go += `\treq, err := http.NewRequest("${method}", "${fullUrl}", body)\n`;
  } else {
    go += `\treq, err := http.NewRequest("${method}", "${fullUrl}", nil)\n`;
  }
  go += `\tif err != nil {\n\t\tpanic(err)\n\t}\n\n`;
  headersList.forEach(
    (h) => (go += `\treq.Header.Set("${h.key}", "${h.value}")\n`),
  );
  if (headersList.length) go += `\n`;
  go += `\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n`;
  go += `\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n`;
  go += `\tresBody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(resBody))\n}`;

  return { curl, javascript: js, python: py, go };
}
