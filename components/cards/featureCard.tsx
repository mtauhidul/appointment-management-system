import Image from "next/image";

const FeatureCard = ({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-col justify-center items-center w-[120px] sm:w-[160px]">
    <div className="bg-white p-2 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex justify-center items-center mb-2">
      <Image src={src} alt={alt} width={40} height={40} className="mx-auto" />
    </div>
    <p className="text-white text-center font-semibold text-sm sm:text-base">
      {label}
    </p>
  </div>
);

export default FeatureCard;
