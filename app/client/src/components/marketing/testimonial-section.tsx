import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestimonialSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10">
            <Image
              src="/icons/testimonial_icon1.svg"
              alt=""
              width={80}
              height={80}
              className="w-24 h-24 md:w-20 md:h-20"
            />
          </div>
          <div className="absolute bottom-10 right-10">
            <Image
              src="/icons/testimonial_icon2.svg"
              alt=""
              width={80}
              height={80}
              className="w-24 h-24 md:w-20 md:h-20"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <div className="inline-block">
              <div className="absolute -inset-3 rounded-full -z-10"></div>
              <h2 className="relative text-3xl md:text-4xl font-bold px-8 py-2">
                Managing HR is no easy feat!
              </h2>
            </div>

            <p className="mt-8 text-lg md:text-xl leading-relaxed">
              And often overwhelming without the right
              <br />
              tools or support. That's where <span className="font-semibold">Staffly HR</span> steps in.
              <br />
              More than just software, we're
              <br />
              here to simplify your work.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button
                size="lg"
                asChild>
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}