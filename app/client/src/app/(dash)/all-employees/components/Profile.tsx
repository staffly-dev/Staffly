"use client";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { BriefcaseIcon, LockIcon } from "lucide-react";
import { Employee } from "@/types/employee";

export function Profile({ employee }: { employee: Employee }) {
  const [step, setStep] = useState(0);
  const handleTabChange = (value: string) => {
    setStep(parseInt(value));
  };

  const joinDate = new Date(employee.joiningAt).toLocaleDateString();
  const dob = new Date(employee.dateOfBrith).toLocaleDateString();
  const updatedAt = new Date(employee.updatedAt).toLocaleString();
  const createdAt = new Date(employee.createdAt).toLocaleString();
  employee.joiningAt = joinDate;
  employee.dateOfBrith = dob;
  employee.updatedAt = updatedAt;
  employee.createdAt = createdAt;

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
          {/* <TabsTrigger value="2" className="flex items-center space-x-2">
            <FileTextIcon size={16} />
            <span>Documents</span>
          </TabsTrigger> */}
          <TabsTrigger value="3" className="flex items-center space-x-2">
            <LockIcon size={16} />
            <span>Account Access</span>
          </TabsTrigger>
        </TabsList>
        {step === 0 && <PersonalInformation personalInfo={employee} />}
        {step === 1 && <ProfessionalInformation professionalInfo={employee} />}
        {/* {step === 2 && <Documents documents={employee} />} */}
        {step === 3 && <AccountAccess accountAccess={employee} />}
      </Tabs>
    </div>
  );
}

function PersonalInformation({ personalInfo }: { personalInfo: Employee }) {
  return (
    <TabsContent value="0" className="">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(personalInfo)
          .slice(3, 14)
          .map((key) => (
            <div
              key={key}
              className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
            >
              <span className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <p>{personalInfo[key as keyof Employee] as string}</p>
            </div>
          ))}
      </div>
    </TabsContent>
  );
}

function ProfessionalInformation({
  professionalInfo,
}: {
  professionalInfo: Employee;
}) {
  return (
    <TabsContent value="1">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(professionalInfo)
          .slice(12, 21)
          .map((key) => (
            <div
              key={key}
              className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
            >
              <span className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <p>{professionalInfo[key as keyof Employee] as string}</p>
            </div>
          ))}
      </div>
    </TabsContent>
  );
}

// function Documents({ documents }: { documents: Employee }) {
//   return (
//     <TabsContent value="2">
//       <div className="grid grid-cols-2 gap-4 py-4">
//         {Object.keys(documents).map((key) => (
//           <div
//             key={key}
//             className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
//           >
//             <span className="text-sm text-muted-foreground capitalize">
//               {key.replace(/([A-Z])/g, " $1").trim()}
//             </span>
//             <p>{documents[key as keyof Employee] as string}</p>
//           </div>
//         ))}
//       </div>
//     </TabsContent>
//   );
// }

function AccountAccess({ accountAccess }: { accountAccess: Employee }) {
  return (
    <TabsContent value="3">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(accountAccess)
          .slice(21, 26)
          .map((key) => (
            <div
              key={key}
              className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
            >
              <span className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <p>{accountAccess[key as keyof Employee] as string}</p>
            </div>
          ))}
      </div>
    </TabsContent>
  );
}
