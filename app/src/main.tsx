import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import App from "./App";

function Root() {
  const { theme } = useTheme();
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <App />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </React.StrictMode>,
);
