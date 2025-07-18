"use client";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BriefcaseIcon, LockIcon, FileTextIcon } from "lucide-react";

export interface EmployeeAdded {
  id: string;
  photo: string;
  personalInfo: {
    name: string;
    email: string;
    phone: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
  };
  professionalInfo: {
    employeeId: string;
    userName: string;
    workEmail: string;
    department: string;
    status: string;
    joiningDate: string;
    officeLocation: string;
    designation: string;
    workingDays: string;
    employeeType: string;
  };
  documents: {
    appointmentLetter: string;
    salarySlips: string;
    relivingLetter: string;
    experienceLetter: string;
  };
  accountAccess: {
    emailAddress: string;
    skypeId: string;
    githubId: string;
    slackId: string;
  };
}

export function Profile({ employee }: { employee: EmployeeAdded }) {
  const [step, setStep] = useState(0);
  const handleTabChange = (value: string) => {
    setStep(parseInt(value));
  };

  const personalInfo = employee.personalInfo;
  const professionalInfo = employee.professionalInfo;
  const documents = employee.documents;
  const accountAccess = employee.accountAccess;

  return (
    <div>
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
        {step === 0 && <PersonalInformation personalInfo={personalInfo} />}
        {step === 1 && (
          <ProfessionalInformation professionalInfo={professionalInfo} />
        )}
        {step === 2 && <Documents documents={documents} />}
        {step === 3 && <AccountAccess accountAccess={accountAccess} />}
      </Tabs>
    </div>
  );
}

function PersonalInformation({
  personalInfo,
}: {
  personalInfo: EmployeeAdded["personalInfo"];
}) {
  return (
    <TabsContent value="0" className="">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(personalInfo).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{personalInfo[key as keyof EmployeeAdded["personalInfo"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function ProfessionalInformation({
  professionalInfo,
}: {
  professionalInfo: EmployeeAdded["professionalInfo"];
}) {
  return (
    <TabsContent value="1">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(professionalInfo).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>
              {professionalInfo[key as keyof EmployeeAdded["professionalInfo"]]}
            </p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function Documents({ documents }: { documents: EmployeeAdded["documents"] }) {
  return (
    <TabsContent value="2">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(documents).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{documents[key as keyof EmployeeAdded["documents"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function AccountAccess({
  accountAccess,
}: {
  accountAccess: EmployeeAdded["accountAccess"];
}) {
  return (
    <TabsContent value="3">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(accountAccess).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{accountAccess[key as keyof EmployeeAdded["accountAccess"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
