import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your HR experience?
          </h2>
          <p className="text-lg mb-8">
            Join thousands of businesses that trust Staffly HR to streamline their HR processes and boost team productivity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              asChild
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <Link href="#">
                Request a Demo
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-16">
          <div
            aria-hidden
            className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
          />
          <div className="relative mx-auto max-w-6xl overflow-hidden px-4">
            <Image
              className="z-2 border-border/25 relative rounded-2xl border"
              src="/imgs/frame.png"
              alt="app screen"
              width={1596}
              height={808}
            />
          </div>
        </div>
      </div>
    </section>
  );
}