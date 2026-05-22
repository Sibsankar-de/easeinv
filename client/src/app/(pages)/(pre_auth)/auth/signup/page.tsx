import type { Metadata } from "next";
import { SignupForm } from '@/components/forms/SignupForm'
import Link from 'next/link'

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create your EaseInv account and start managing billing, inventory, and customers in one place.",
}

export default function SignupPage() {
    return (
        <>
            {/* Signup Form */}
            <SignupForm />

            {/* login Link */}
            <p className="text-center mt-6 text-gray-600">
                Already have an account?{' '}
                <Link href={"/auth/login"} className="text-primary hover:text-primary/50">
                    Login to continue!
                </Link>
            </p>
        </>
    )
}
