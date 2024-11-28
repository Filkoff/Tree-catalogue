import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import TreeView1 from "./TreeView";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const [count, setCount] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Catalogue</h1>
        <TreeView1 />
      </div>
    </QueryClientProvider>
  );
}

export default App;
