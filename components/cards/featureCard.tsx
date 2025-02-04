const FeatureCard = ({
  icon,
  label,
}: {
  icon: { (): JSX.Element };
  label: string;
}) => (
  <div className="flex flex-col justify-center items-center w-[120px] sm:w-[160px]">
    <div className="bg-white p-2 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex justify-center items-center mb-2">
      {icon()}
    </div>
    <p className="text-white text-center font-semibold text-sm sm:text-base">
      {label}
    </p>
  </div>
);

export default FeatureCard;
