import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

const Navbar = () => {
    return (
        <div className='flex items-center justify-between py-4'>
            <div>
                <p className='text-2xl'>Flow.AI</p>
            </div>
            <div className='flex items-center gap-10'>
                <Link href="/dashboard">Create</Link>
                <Link href={"/learn"}>Learn</Link>
                <Link href={"/pricing"}>Pricing</Link>
                <Link href={"/login"}>
                    <Button>Login</Button>
                </Link>
            </div>
        </div>
    )
}

export default Navbar