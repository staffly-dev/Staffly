import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Candidate } from "@/hooks/useJobs";
import { handleCVLink } from "@/lib/utils";
import Link from "next/link";
import { FaFilePdf } from "react-icons/fa";
import { IoMdMailOpen } from "react-icons/io";

interface CandidateInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
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
            {candidate?.interview && (
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-semibold block mb-3">
                  Interview Details
                </Label>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{candidate.interview.interview_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span>{candidate.interview.interview_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">
                      {candidate.interview.interview_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{candidate.interview.location}</span>
                  </div>
                  {candidate.interview.notes && (
                    <div className="mt-2">
                      <span className="text-muted-foreground block mb-1">
                        Notes
                      </span>
                      <p className="text-foreground">
                        {candidate.interview.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
