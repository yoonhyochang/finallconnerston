import dynamic from "next/dynamic";
import { useEffect } from "react";
const Annotations = dynamic(import('../components/Annotations'), {ssr: false})
const Viewport = dynamic(import("../components/Viewport"), { ssr: false });
const ToolsBar = dynamic(import("../components/ToolsBar"), { ssr: false });
const Volume = dynamic(import("../components/Volume"), { ssr: false });
const ManipulationTools = dynamic(import("../components/ManipulationTools"), {
  ssr: false,
});


export default function Home() {
  useEffect(() => {
    function handleContextMenu(event) {
      event.preventDefault();
    }

    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
 
  return (
    <div className="h-full w-full">
      <div id="content">
        {/* <ToolsBar /> */}
        <h1>이미지 스택 렌더링</h1>
        <div className="flex">
          {/*  <Viewport /> */}
          {/* {<Annotations />} */}
        </div>
      </div>
      <h1>볼륨 렌더링</h1>
      <div className="flex">
        {/* <Volume /> */}
      </div>
      <h1>조작 도구</h1>
      <div className="flex">
        <ManipulationTools />
      </div>
    </div>
  );
}
