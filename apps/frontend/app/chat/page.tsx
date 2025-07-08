import {PromptInputBox}  from "@/components/ai-prompt-box";

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center">
      <div className="p-4 w-[700px] mt-32">
        <p className="text-center mb-10 text-4xl">Which Video to Generate Next?</p>
        <PromptInputBox />
      </div>
    </div>
  );
};

export default DemoOne;