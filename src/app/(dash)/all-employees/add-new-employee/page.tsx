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

export default function MultiStepForm() {
  const [step, setStep] = useState(0);

  return (
    <Card className="p-4">
      <Tabs
        value={String(step)}
        onValueChange={(value) => setStep(Number(value))}
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

        <Personal />

        <Professional />

        <Docs />

        <Access />

        {/* Buttons */}
        <div className="flex justify-between items-center p-4">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button onClick={() => setStep(step + 1)} disabled={step === 3}>
            Next
          </Button>
        </div>
      </Tabs>
    </Card>
  );
}

// step 1
function Personal() {
  const [image, setImage] = useState<{
    image: File | null;
    preview: string | null;
  }>({
    image: null,
    preview: null,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setImage({ image: file, preview: photoUrl });
    }
  };
  return (
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
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <Input placeholder="First Name" />
        <Input placeholder="Last Name" />
        <Input placeholder="Mobile Number" />
        <Input placeholder="Email Address" />
        <Input placeholder="Date of Birth" type="date" className="block" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Marital Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="egyptian">Egyptian</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Address" className="col-span-2" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cairo">Cairo</SelectItem>
            <SelectItem value="giza">Giza</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cairo">Cairo</SelectItem>
            <SelectItem value="giza">Giza</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </TabsContent>
  );
}

// step 2
function Professional() {
  return (
    <TabsContent value="1">
      <div className="grid grid-cols-2 gap-4 p-4">
        <Input placeholder="Employee ID" type="number" />
        <Input placeholder="User Name" />
        <Input placeholder="Email Address" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Joining Date" type="date" className="block" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Office Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="R">Assuit</SelectItem>
            <SelectItem value="O">Sohage</SelectItem>
            <SelectItem value="H">Cairo</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Enter Designation" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Working Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="R">Remote</SelectItem>
            <SelectItem value="O">Onsite</SelectItem>
            <SelectItem value="H">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <div className="col-span-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="R">Remote</SelectItem>
              <SelectItem value="O">Onsite</SelectItem>
              <SelectItem value="H">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </TabsContent>
  );
}
function Docs() {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    appointmentLetter: null,
    salarySlips: null,
    relivingLetter: null,
    experienceLetter: null,
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0] || null;
    if (file) setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLabelElement>,
    type: string
  ) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    if (file) setFiles((prevFiles) => ({ ...prevFiles, [type]: file }));
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  return (
    <TabsContent value="2">
      <div className="grid grid-cols-2 gap-4 p-4">
        {[
          { label: "Appointment Letter", type: "appointmentLetter" },
          { label: "Salary Slips", type: "salarySlips" },
          { label: "Reliving Letter", type: "relivingLetter" },
          { label: "Experience Letter", type: "experienceLetter" },
        ].map(({ label, type }) => (
          <div key={type}>
            <p className="mb-2 font-semibold">{`Upload ${label}`}</p>
            <label
              htmlFor={type}
              className="cursor-pointer block"
              onDrop={(event) => handleDrop(event, type)}
              onDragOver={handleDragOver}
            >
              <Card className="h-32 flex flex-col items-center justify-center border-dashed border-2 rounded-lg p-4 text-center">
                {files[type] ? (
                  <p className="text-sm text-gray-500">{files[type]?.name}</p>
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
              onChange={(event) => handleFileChange(event, type)}
            />
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function Access() {
  return (
    <TabsContent value="3">
      <div className="grid grid-cols-2 gap-4 p-4">
        <Input placeholder="Enter Email Address" />
        <Input placeholder="Skype ID" />
        <Input placeholder="Github ID" />
        <Input placeholder="Slack ID" />
      </div>
    </TabsContent>
  );
}
