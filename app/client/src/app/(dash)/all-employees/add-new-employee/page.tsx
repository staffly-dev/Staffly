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
import { LockIcon, BriefcaseIcon, FileTextIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
// import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newEmployeeSchema,
  NewEmployeeFormData,
} from "@/lib/validations/newEmployee";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useEmployee } from "@/context/EmployeeContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateEmployeeData } from "@/types/employee";
import {
  cities,
  departments,
  nationalities,
  offices,
  states,
} from "@/app/constants";
import Combobox from "@/components/ui/combobox";

export default function MultiStepForm() {
  const router = useRouter();
  const { addEmployee, error, clearError } = useEmployee();
  const [step, setStep] = useState(0);
  // const [image, setImage] = useState<{
  //   image: File | null;
  //   preview: string | null;
  // }>({
  //   image: null,
  //   preview: null,
  // });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<NewEmployeeFormData>({
    resolver: zodResolver(newEmployeeSchema),
    defaultValues: {
      mobileNumber: "+201000000000",
    },
  });

  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const photoUrl = URL.createObjectURL(file);
  //     setImage({ image: file, preview: photoUrl });
  //   }
  // };

  const onSubmit = async (data: NewEmployeeFormData) => {
    console.log(" submitted:", data);
    try {
      const employee = await addEmployee(data as CreateEmployeeData);
      toast.success("Employee added successfully");
      router.push(`/all-employees/${employee._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  type fieldNames = keyof NewEmployeeFormData;

  // const [files, setFiles] = useState<{ [key: string]: File | null }>({
  //   appointmentLetter: null,
  //   salarySlips: null,
  //   relivingLetter: null,
  //   experienceLetter: null,
  // });

  // Get fields to validate for a specific step
  const getFieldsToValidate = (stepNumber: number): fieldNames[] => {
    switch (stepNumber) {
      case 0: // Personal
        return [
          "firstName",
          "lastName",
          "mobileNumber",
          "emailAddress",
          "dateOfBrith",
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
          "zipcode",
        ] as fieldNames[];
      // case 2: // Documents
      //   return [
      //     "appointmentLetter",
      //     "salarySlips",
      //     "relivingLetter",
      //     "experienceLetter",
      //   ] as fieldNames[];
      case 3: // Account Access
        return ["linkdeinLink", "githubLink", "slackUserName"] as fieldNames[];
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

  // const handleFileChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   type: fieldNames
  // ) => {
  //   const file = event.target.files?.[0] || null;
  //   if (file) {
  //     setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
  //     setValue(type, file);
  //   }
  // };

  // const handleDrop = (
  //   event: React.DragEvent<HTMLLabelElement>,
  //   type: fieldNames
  // ) => {
  //   event.preventDefault();
  //   const file = event.dataTransfer.files?.[0] || null;
  //   if (file) {
  //     setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
  //     setValue(type, file);
  //   }
  // };

  // const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
  //   event.preventDefault();
  // };

  return (
    <Card className="p-4">
      {error && (
        <div className="flex items-center gap-2 text-red-500 p-2">
          <p>{error}, Check your inputs and try again</p>
          <Button variant="outline" onClick={clearError}>
            Clear Error
          </Button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Form submit event");
          handleSubmit(onSubmit)(e);
        }}
      >
        <Tabs value={String(step)} onValueChange={handleTabChange}>
          {/* Step Navigation */}
          <TabsList className="flex space-x-4 border-b border-hrms-gray/20 p-2">
            <TabsTrigger value="0" className="flex items-center space-x-2">
              <IoPersonCircleOutline size={16} />
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
              {/* <div className="col-span-2 w-fit">
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
                  {...register("profilePicture")}
                  onChange={handleImageChange}
                />
                {errors.profilePicture && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profilePicture.message as string}
                  </p>
                )}
</div> */}

              <div className="col-span-2 w-fit">
                <Input
                  placeholder="Profile Image Link"
                  {...register("profilePicture")}
                />
                {errors.profilePicture && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profilePicture.message as string}
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
                <Input
                  placeholder="Email Address"
                  {...register("emailAddress")}
                />
                {errors.emailAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emailAddress.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Date of Birth"
                  type="date"
                  className="block"
                  {...register("dateOfBrith")}
                />
                {errors.dateOfBrith && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dateOfBrith.message as string}
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
                <Combobox
                  initialValues={nationalities}
                  placeholder="Nationality"
                  searchPlaceholder="Search nationality..."
                  onValueChange={(value) => setValue("nationality", value)}
                />
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
                <Combobox
                  initialValues={cities}
                  placeholder="City"
                  searchPlaceholder="Search city..."
                  onValueChange={(value) => setValue("city", value)}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message as string}
                  </p>
                )}
              </div>
              <div>
                <Combobox
                  initialValues={states}
                  placeholder="State"
                  searchPlaceholder="Search state..."
                  onValueChange={(value) => setValue("state", value)}
                />
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
                <Input placeholder="User Name" {...register("userName")} />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.userName.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Email Address"
                  {...register("emailAddress")}
                />
                {errors.emailAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emailAddress.message as string}
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
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
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
                  {...register("joiningAt")}
                />
                {errors.joiningAt && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.joiningAt.message as string}
                  </p>
                )}
              </div>
              <div>
                <Combobox
                  initialValues={offices}
                  placeholder="Office Location"
                  searchPlaceholder="Search office location..."
                  onValueChange={(value) => setValue("officeLocation", value)}
                />
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
                <Input
                  placeholder="Enter Working Days"
                  {...register("workingDays")}
                />
                {errors.workingDays && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.workingDays.message as string}
                  </p>
                )}
              </div>
              <div>
                <Select
                  onValueChange={(value) => setValue("employeeType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
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
          {/* <TabsContent value="2">
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
                    onChange={(event) =>
                      handleFileChange(event, type as fieldNames)
                    }
                  />
                  {errors[type as fieldNames] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[type as fieldNames]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent> */}

          {/*  step 3: Account Access */}
          <TabsContent value="3">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <Input
                  placeholder="Enter LinkedIn Link"
                  {...register("linkdeinLink")}
                />
                {errors.linkdeinLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.linkdeinLink.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Enter Github Link"
                  {...register("githubLink")}
                />
                {errors.githubLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.githubLink?.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Enter Slack User Name"
                  {...register("slackUserName")}
                />
                {errors.slackUserName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slackUserName?.message as string}
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
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
            )}
          </div>
        </Tabs>
      </form>
    </Card>
  );
}
