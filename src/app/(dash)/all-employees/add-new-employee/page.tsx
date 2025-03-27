// "use client";
// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { LockIcon, BriefcaseIcon, FileTextIcon, Upload } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import Image from "next/image";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   newEmployeeSchema,
//   NewEmployeeFormData,
// } from "@/lib/validations/newEmployee";

// export default function MultiStepForm() {
//   const [step, setStep] = useState(0);
//   const [image, setImage] = useState<{
//     image: File | null;
//     preview: string | null;
//   }>({
//     image: null,
//     preview: null,
//   });

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     trigger,
//     formState: { errors, isSubmitting },
//   } = useForm<NewEmployeeFormData>({
//     resolver: zodResolver(newEmployeeSchema),
//   });

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const photoUrl = URL.createObjectURL(file);
//       setImage({ image: file, preview: photoUrl });
//     }
//   };

//   const onSubmit = (data: NewEmployeeFormData) => {
//     console.log("Form submitted:", data);
//     // Handle form submission here
//   };
//   type fieldNames = keyof NewEmployeeFormData;

//   const nextStep = async () => {
//     let fieldsToValidate: string[] = [];

//     // Define which fields to validate for each step
//     switch (step) {
//       case 0: // Personal
//         fieldsToValidate = [
//           "firstName",
//           "lastName",
//           "mobileNumber",
//           "email",
//           "dateOfBirth",
//           "maritalStatus",
//           "gender",
//           "nationality",
//           "address",
//           "city",
//           "state",
//         ];
//         break;
//       case 1: // Professional
//         fieldsToValidate = [
//           "employeeId",
//           "userName",
//           "workEmail",
//           "department",
//           "joiningDate",
//           "officeLocation",
//           "designation",
//           "workingDays",
//           "employeeType",
//         ];
//         break;
//       case 2: // Documents
//         fieldsToValidate = [
//           "appointmentLetter",
//           "salarySlips",
//           "relivingLetter",
//           "experienceLetter",
//         ];
//         break;
//       case 3: // Account Access
//         fieldsToValidate = ["emailAddress", "skypeId", "githubId", "slackId"];
//         break;
//     }

//     const isStepValid = await trigger(fieldsToValidate as fieldNames[]);

//     if (isStepValid) {
//       setStep(step + 1);
//     }
//   };

//   const [files, setFiles] = useState<{ [key: string]: File | null }>({
//     appointmentLetter: null,
//     salarySlips: null,
//     relivingLetter: null,
//     experienceLetter: null,
//   });

//   const handleFileChange = (
//     event: React.ChangeEvent<HTMLInputElement>,
//     type: fieldNames
//   ) => {
//     const file = event.target.files?.[0] || null;
//     if (file) {
//       setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
//       setValue(type, file);
//     }
//   };

//   const handleDrop = (event: React.DragEvent<HTMLLabelElement>, type: fieldNames) => {
//     event.preventDefault();
//     const file = event.dataTransfer.files?.[0] || null;
//     if (file) {
//       setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
//       setValue(type, file);
//     }
//   };

//   const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
//     event.preventDefault();
//   };

//   return (
//     <Card className="p-4">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Tabs
//           value={String(step)}
//           onValueChange={(value) => setStep(Number(value))}
//         >
//           {/* Step Navigation */}
//           <TabsList className="flex space-x-4 border-b border-hrms-gray/20 p-2">
//             <TabsTrigger value="0" className="flex items-center space-x-2">
//               <LockIcon size={16} />
//               <span>Personal Information</span>
//             </TabsTrigger>
//             <TabsTrigger value="1" className="flex items-center space-x-2">
//               <BriefcaseIcon size={16} />
//               <span>Professional Information</span>
//             </TabsTrigger>
//             <TabsTrigger value="2" className="flex items-center space-x-2">
//               <FileTextIcon size={16} />
//               <span>Documents</span>
//             </TabsTrigger>
//             <TabsTrigger value="3" className="flex items-center space-x-2">
//               <LockIcon size={16} />
//               <span>Account Access</span>
//             </TabsTrigger>
//           </TabsList>

//           {/*  step 0: Personal Information */}
//           <TabsContent value="0">
//             <div className="grid grid-cols-2 gap-4 p-4">
//               <div className="col-span-2 w-fit">
//                 <label htmlFor="image-upload" className="cursor-pointer w-24">
//                   <Card className="w-24 h-24 flex items-center justify-center cursor-pointer border-2 rounded-lg">
//                     {image.preview ? (
//                       <Image
//                         src={image.preview}
//                         width={100}
//                         height={100}
//                         alt="Uploaded"
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                     ) : (
//                       <Upload className="text-hrms-gray/30 w-6 h-6" />
//                     )}
//                   </Card>
//                 </label>
//                 <input
//                   type="file"
//                   id="photo"
//                   className="hidden"
//                   accept="image/*"
//                   {...register("photo")}
//                   onChange={handleImageChange}
//                 />
//                 {errors.photo && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.photo.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="First Name" {...register("firstName")} />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.firstName.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Last Name" {...register("lastName")} />
//                 {errors.lastName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.lastName.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input
//                   placeholder="Mobile Number"
//                   {...register("mobileNumber")}
//                 />
//                 {errors.mobileNumber && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.mobileNumber.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Email Address" {...register("email")} />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.email.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input
//                   placeholder="Date of Birth"
//                   type="date"
//                   className="block"
//                   {...register("dateOfBirth")}
//                 />
//                 {errors.dateOfBirth && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.dateOfBirth.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select
//                   onValueChange={(value) => setValue("maritalStatus", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Marital Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="single">Single</SelectItem>
//                     <SelectItem value="married">Married</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.maritalStatus && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.maritalStatus.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select onValueChange={(value) => setValue("gender", value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="male">Male</SelectItem>
//                     <SelectItem value="female">Female</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.gender && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.gender.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select
//                   onValueChange={(value) => setValue("nationality", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Nationality" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="egyptian">Egyptian</SelectItem>
//                     <SelectItem value="other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.nationality && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.nationality.message as string}
//                   </p>
//                 )}
//               </div>
//               <div className="col-span-2">
//                 <Input
//                   placeholder="Address"
//                   className="col-span-2"
//                   {...register("address")}
//                 />
//                 {errors.address && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.address.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select onValueChange={(value) => setValue("city", value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="City" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cairo">Cairo</SelectItem>
//                     <SelectItem value="giza">Giza</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.city && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.city.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select onValueChange={(value) => setValue("state", value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="State" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cairo">Cairo</SelectItem>
//                     <SelectItem value="giza">Giza</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.state && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.state.message as string}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </TabsContent>

//           {/*  step 1: Professional Information */}
//           <TabsContent value="1">
//             <div className="grid grid-cols-2 gap-4 p-4">
//               <div>
//                 <Input
//                   placeholder="Employee ID"
//                   type="number"
//                   {...register("employeeId")}
//                 />
//                 {errors.employeeId && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.employeeId.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="User Name" {...register("userName")} />
//                 {errors.userName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.userName.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Email Address" {...register("workEmail")} />
//                 {errors.workEmail && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.workEmail.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select
//                   onValueChange={(value) => setValue("department", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Department" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="IT">IT</SelectItem>
//                     <SelectItem value="Sales">Sales</SelectItem>
//                     <SelectItem value="HR">HR</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.department && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.department.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input
//                   placeholder="Joining Date"
//                   type="date"
//                   className="block"
//                   {...register("joiningDate")}
//                 />
//                 {errors.joiningDate && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.joiningDate.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select
//                   onValueChange={(value) => setValue("officeLocation", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Office Location" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Assuit">Assuit</SelectItem>
//                     <SelectItem value="Sohage">Sohage</SelectItem>
//                     <SelectItem value="Cairo">Cairo</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.officeLocation && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.officeLocation.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input
//                   placeholder="Enter Designation"
//                   {...register("designation")}
//                 />
//                 {errors.designation && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.designation.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Select
//                   onValueChange={(value) => setValue("workingDays", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Working Days" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Remote">Remote</SelectItem>
//                     <SelectItem value="Onsite">Onsite</SelectItem>
//                     <SelectItem value="Hybrid">Hybrid</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.workingDays && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.workingDays.message as string}
//                   </p>
//                 )}
//               </div>
//               <div className="col-span-2">
//                 <Select
//                   onValueChange={(value) => setValue("employeeType", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Employee Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Remote">Remote</SelectItem>
//                     <SelectItem value="Onsite">Onsite</SelectItem>
//                     <SelectItem value="Hybrid">Hybrid</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.employeeType && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.employeeType.message as string}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </TabsContent>

//           {/*  step 2: Upload Documents */}
//           <TabsContent value="2">
//             <div className="grid grid-cols-2 gap-4 p-4">
//               {[
//                 { label: "Appointment Letter", type: "appointmentLetter" },
//                 { label: "Salary Slips", type: "salarySlips" },
//                 { label: "Reliving Letter", type: "relivingLetter" },
//                 { label: "Experience Letter", type: "experienceLetter" },
//               ].map(({ label, type }) => (
//                 <div key={type}>
//                   <p className="mb-2 font-semibold">Upload {label}</p>
//                   <label
//                     htmlFor={type}
//                     className="cursor-pointer block"
//                     onDrop={(event) => handleDrop(event, type)}
//                     onDragOver={handleDragOver}
//                   >
//                     <Card className="h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-lg p-4 text-center">
//                       {files[type] ? (
//                         <p className="text-sm text-gray-500">
//                           {files[type]?.name}
//                         </p>
//                       ) : (
//                         <>
//                           <Upload className="text-hrms-gray/30 w-8 h-8 mb-2" />
//                           <p className="text-sm">
//                             Drag & Drop or{" "}
//                             <span className="text-blue-500 underline">
//                               choose file
//                             </span>{" "}
//                             to upload
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             Supported formats: JPEG, PDF
//                           </p>
//                         </>
//                       )}
//                     </Card>
//                   </label>
//                   <input
//                     type="file"
//                     id={type}
//                     className="hidden"
//                     accept=".jpeg,.jpg,.pdf"
//                     onChange={(event) => handleFileChange(event, type)}
//                   />
//                   {errors[type] && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors[type].message as string}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </TabsContent>

//           {/*  step 3: Account Access */}
//           <TabsContent value="3">
//             <div className="grid grid-cols-2 gap-4 p-4">
//               <div>
//                 <Input
//                   placeholder="Enter Email Address"
//                   {...register("emailAddress")}
//                 />
//                 {errors.emailAddress && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.emailAddress.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Skype ID" {...register("skypeId")} />
//                 {errors.skypeId && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.skypeId.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Github ID" {...register("githubId")} />
//                 {errors.githubId && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.githubId.message as string}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <Input placeholder="Slack ID" {...register("slackId")} />
//                 {errors.slackId && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.slackId.message as string}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </TabsContent>

//           {/* Buttons */}
//           <div className="flex justify-between items-center p-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setStep(step - 1)}
//               disabled={step === 0}
//             >
//               Back
//             </Button>
//             {step < 3 && (
//               <Button type="button" onClick={nextStep}>
//                 Next
//               </Button>
//             )}
//             {step === 3 && (
//               <Button disabled={isSubmitting} type="submit">
//                 Add
//               </Button>
//             )}
//           </div>
//         </Tabs>
//       </form>
//     </Card>
//   );
// }
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LockIcon, BriefcaseIcon, FileTextIcon, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newEmployeeSchema,
  NewEmployeeFormData,
} from "@/lib/validations/newEmployee";

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<{
    image: File | null;
    preview: string | null;
  }>({
    image: null,
    preview: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<NewEmployeeFormData>({
    resolver: zodResolver(newEmployeeSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setImage({ image: file, preview: photoUrl });
    }
  };

  const onSubmit = (data: NewEmployeeFormData) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };
  
  type fieldNames = keyof NewEmployeeFormData;

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    appointmentLetter: null,
    salarySlips: null,
    relivingLetter: null,
    experienceLetter: null,
  });

  // Get fields to validate for a specific step
  const getFieldsToValidate = (stepNumber: number): fieldNames[] => {
    switch (stepNumber) {
      case 0: // Personal
        return [
          "firstName",
          "lastName",
          "mobileNumber",
          "email",
          "dateOfBirth",
          "maritalStatus",
          "gender",
          "nationality",
          "address",
          "city",
          "state",
        ] as fieldNames[];
      case 1: // Professional
        return [
          "employeeId",
          "userName",
          "workEmail",
          "department",
          "joiningDate",
          "officeLocation",
          "designation",
          "workingDays",
          "employeeType",
        ] as fieldNames[];
      case 2: // Documents
        return [
          "appointmentLetter",
          "salarySlips",
          "relivingLetter",
          "experienceLetter",
        ] as fieldNames[];
      case 3: // Account Access
        return ["emailAddress", "skypeId", "githubId", "slackId"] as fieldNames[];
      default:
        return [] as fieldNames[];
    }
  };

  // Validate current step
  const validateStep = async (currentStep: number): Promise<boolean> => {
    const fieldsToValidate = getFieldsToValidate(currentStep);
    return await trigger(fieldsToValidate);
  };

  // Handle tab change
  const handleTabChange = async (value: string) => {
    const targetStep = Number(value);
    const currentStep = step;
    
    // Moving forward (need to validate)
    if (targetStep > currentStep) {
      // Validate all previous steps
      for (let i = 0; i <= currentStep; i++) {
        const isStepValid = await validateStep(i);
        if (!isStepValid) {
          // If any step fails validation, don't proceed
          return;
        }
      }
    }
    
    // If validation passes or we're moving backwards, change the step
    setStep(targetStep);
  };

  const nextStep = async () => {
    const isStepValid = await validateStep(step);
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: fieldNames
  ) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
      setValue(type, file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>, type: fieldNames) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
      setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
      setValue(type, file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs
          value={String(step)}
          onValueChange={handleTabChange}
        >
          {/* Step Navigation */}
          <TabsList className="flex space-x-4 border-b border-hrms-gray/20 p-2">
            <TabsTrigger value="0" className="flex items-center space-x-2">
              <LockIcon size={16} />
              <span>Personal Information</span>
            </TabsTrigger>
            <TabsTrigger value="1" className="flex items-center space-x-2">
              <BriefcaseIcon size={16} />
              <span>Professional Information</span>
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center space-x-2">
              <FileTextIcon size={16} />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center space-x-2">
              <LockIcon size={16} />
              <span>Account Access</span>
            </TabsTrigger>
          </TabsList>

          {/*  step 0: Personal Information */}
          <TabsContent value="0">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="col-span-2 w-fit">
                <label htmlFor="image-upload" className="cursor-pointer w-24">
                  <Card className="w-24 h-24 flex items-center justify-center cursor-pointer border-2 rounded-lg">
                    {image.preview ? (
                      <Image
                        src={image.preview}
                        width={100}
                        height={100}
                        alt="Uploaded"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Upload className="text-hrms-gray/30 w-6 h-6" />
                    )}
                  </Card>
                </label>
                <input
                  type="file"
                  id="photo"
                  className="hidden"
                  accept="image/*"
                  {...register("photo")}
                  onChange={handleImageChange}
                />
                {errors.photo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.photo.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="First Name" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Last Name" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Mobile Number"
                  {...register("mobileNumber")}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobileNumber.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Email Address" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Date of Birth"
                  type="date"
                  className="block"
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dateOfBirth.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("maritalStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maritalStatus && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maritalStatus.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select onValueChange={(value) => setValue("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gender.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("nationality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="egyptian">Egyptian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nationality && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nationality.message as string}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="Address"
                  className="col-span-2"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select onValueChange={(value) => setValue("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="giza">Giza</SelectItem>
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select onValueChange={(value) => setValue("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="giza">Giza</SelectItem>
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.state.message as string}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/*  step 1: Professional Information */}
          <TabsContent value="1">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <Input
                  placeholder="Employee ID"
                  type="number"
                  {...register("employeeId")}
                />
                {errors.employeeId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.employeeId.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="User Name" {...register("userName")} />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.userName.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Email Address" {...register("workEmail")} />
                {errors.workEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.workEmail.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.department.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Joining Date"
                  type="date"
                  className="block"
                  {...register("joiningDate")}
                />
                {errors.joiningDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.joiningDate.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("officeLocation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Office Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assuit">Assuit</SelectItem>
                    <SelectItem value="Sohage">Sohage</SelectItem>
                    <SelectItem value="Cairo">Cairo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.officeLocation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.officeLocation.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Enter Designation"
                  {...register("designation")}
                />
                {errors.designation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.designation.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("workingDays", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Working Days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workingDays && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.workingDays.message as string}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Select
                  onValueChange={(value) => setValue("employeeType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employeeType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.employeeType.message as string}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/*  step 2: Upload Documents */}
          <TabsContent value="2">
            <div className="grid grid-cols-2 gap-4 p-4">
              {[
                { label: "Appointment Letter", type: "appointmentLetter" },
                { label: "Salary Slips", type: "salarySlips" },
                { label: "Reliving Letter", type: "relivingLetter" },
                { label: "Experience Letter", type: "experienceLetter" },
              ].map(({ label, type }) => (
                <div key={type}>
                  <p className="mb-2 font-semibold">Upload {label}</p>
                  <label
                    htmlFor={type}
                    className="cursor-pointer block"
                    onDrop={(event) => handleDrop(event, type as fieldNames)}
                    onDragOver={handleDragOver}
                  >
                    <Card className="h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-lg p-4 text-center">
                      {files[type] ? (
                        <p className="text-sm text-gray-500">
                          {files[type]?.name}
                        </p>
                      ) : (
                        <>
                          <Upload className="text-hrms-gray/30 w-8 h-8 mb-2" />
                          <p className="text-sm">
                            Drag & Drop or{" "}
                            <span className="text-blue-500 underline">
                              choose file
                            </span>{" "}
                            to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            Supported formats: JPEG, PDF
                          </p>
                        </>
                      )}
                    </Card>
                  </label>
                  <input
                    type="file"
                    id={type}
                    className="hidden"
                    accept=".jpeg,.jpg,.pdf"
                    onChange={(event) => handleFileChange(event, type as fieldNames)}
                  />
                  {errors[type as fieldNames] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[type as fieldNames]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/*  step 3: Account Access */}
          <TabsContent value="3">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <Input
                  placeholder="Enter Email Address"
                  {...register("emailAddress")}
                />
                {errors.emailAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emailAddress.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Skype ID" {...register("skypeId")} />
                {errors.skypeId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.skypeId.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Github ID" {...register("githubId")} />
                {errors.githubId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.githubId.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input placeholder="Slack ID" {...register("slackId")} />
                {errors.slackId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slackId.message as string}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Buttons */}
          <div className="flex justify-between items-center p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 3 && (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button disabled={isSubmitting} type="submit">
                Add
              </Button>
            )}
          </div>
        </Tabs>
      </form>
    </Card>
  );
}