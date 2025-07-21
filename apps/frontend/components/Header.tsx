"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { HeaderBase } from "./HeaderBase";
import { motion } from "motion/react";

export default function Header() {

    const leftContent = (
        <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OpenCut Logo" width={32} height={32} />
            <span className="text-xl font-medium hidden md:block">Flow.AI</span>
        </Link>
    );

    const rightContent = (
        <nav className="flex items-center gap-3">
            <Link href="/contributors">
                <Button variant="text" className="text-sm p-0">
                    Contributors
                </Button>
            </Link>
            {process.env.NODE_ENV === "development" ? (
                <Link href="/projects">
                    <Button size="sm" className="text-sm ml-4">
                        Projects
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            ) : (
                <Link href="https://github.com/OpenCut-app/OpenCut" target="_blank">
                    <Button size="sm" className="text-sm ml-4">
                        GitHub 1000+
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            )}
        </nav>
    );

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mx-4 pt-5 md:mx-0">
            <HeaderBase
                className="bg-accent border rounded-2xl max-w-3xl mx-auto  pl-4 pr-[14px]"
                leftContent={leftContent}
                rightContent={rightContent}
            />
        </motion.div>
    );
}