import dynamic from "next/dynamic";
import { useEffect } from "react";
const Annotations = dynamic(import('../components/Annotations'), {ssr: false})
const Viewport = dynamic(import("../components/Viewport"), { ssr: false });
const ToolsBar = dynamic(import("../components/ToolsBar"), { ssr: false });
const Volume = dynamic(import("../components/Volume"), { ssr: false });

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
        <div className="flex">
          <h1>볼륨 렌더링</h1>
          <Volume />
        </div>
    </div>
  );
}
