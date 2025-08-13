import Image from 'next/image';

const features = [
  {
    icon: '/icons/balance_image1.svg',
    title: 'Empower Team',
    description: 'Give your team better HR support and information to stay on top of everything.'
  },
  {
    icon: '/icons/balance_image2.svg',
    title: 'Save Time',
    description: 'Automate tasks so you can focus on what truly matters.'
  },
  {
    icon: '/icons/balance_image3.svg',
    title: 'Work Fast',
    description: 'Streamline workflows for speed and efficiency.'
  },
  {
    icon: '/icons/balance_image4.svg',
    title: 'Security & Compliance',
    description: 'Stay protected with built-in security and compliance.'
  }
];

export default function BalanceSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get more for less
          </h2>
          <p className="text-xl">
            Get more for less with Staffly HR. Our platform helps you maintain harmony between professional and personal life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center px-4">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="text-blue-600"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}