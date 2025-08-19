import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Candidate } from "@/context/JobContext";
import { handleCVLink } from "@/lib/utils";
import Link from "next/link";
import { FaFilePdf } from "react-icons/fa";
import { IoMdMailOpen } from "react-icons/io";

interface CandidateInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  jobTitle?: string;
}

export function CandidateInfoModal({
  open,
  onOpenChange,
  candidate,
  jobTitle,
}: CandidateInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Candidate Full Info</DialogTitle>
        </DialogHeader>
        <Card className="p-4">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Name</Label>
                <p className="capitalize">{candidate?.candidate_name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm flex items-center gap-1">
                  <IoMdMailOpen className="w-4 h-4" /> Email
                </Label>
                <p>
                  <Link
                    href={`mailto:${candidate?.candidate_email}`}
                    className="hover:text-primary"
                  >
                    {candidate?.candidate_email}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">CV Score</Label>
                <p>{candidate?.cv_score ? candidate?.cv_score : "-"}</p>
              </div>
              <div className="flex flex-col gap-2 ">
                <Label className="text-sm ">Quiz Score</Label>
                <p>{candidate?.quiz_score ? candidate?.quiz_score : "-"}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b">
              <div className="flex flex-col gap-2 ">
                <Label className="text-sm">Status</Label>
                <p>{candidate?.status ? candidate?.status : "-"}</p>
              </div>
              <div className="flex flex-col gap-2  ">
                <Label className="text-sm">Decision</Label>
                <p>{candidate?.decision ? candidate?.decision : "-"}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b">
              <div className="flex flex-col gap-2 ">
                <Label className="text-sm">Resume Link</Label>
                <p>
                  <Link
                    href={
                      candidate?.cv_filename
                        ? handleCVLink(candidate?.cv_filename)
                        : ""
                    }
                    target="_blank"
                    className="hover:text-primary flex items-center gap-1"
                  >
                    <FaFilePdf className="w-4 h-4" />
                    Resume Link
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Job Title</Label>
                <p className="capitalize">{jobTitle ? jobTitle : "-"}</p>
              </div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
