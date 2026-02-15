import { IoCodeWorkingSharp } from "react-icons/io5";

const UnderDevelopment = () => {
  return (
    <div className="absolute bottom-0 w-full h-full  text-white right-0 items-center justify-center flex">
      <div className="text-center flex flex-col items-center gap-2 justify-center rounded-lg bg-primary p-8 ">
        <h3 className="text-2xl font-bold text-white">Under Development</h3>
        <p className="text-sm text-white mt-4">
          This feature is not fully functional. Please check back later.
        </p>
        <IoCodeWorkingSharp className="w-10 h-10" />
      </div>
    </div>
  );
};

export default UnderDevelopment;
