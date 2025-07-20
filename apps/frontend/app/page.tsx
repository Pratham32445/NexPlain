import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PromptBox from "@/components/PromptBox";
import Waitlist from "@/components/Waitlist";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Header/>
      <Hero />
      <PromptBox />
      <Waitlist/>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#87CEEB] via-[#A0522D] to-transparent opacity-20"></div>
    </div>
  );
}
