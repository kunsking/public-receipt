"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import { FCT_AREA_COUNCILS, type FctAreaCouncil } from "@/lib/domain/constants";
import {
  EVIDENCE_OBSERVATION_LABELS,
  EVIDENCE_OBSERVATION_TYPES,
  type EvidenceObservationType,
} from "@/lib/domain/evidence";
import { EVIDENCE_DESCRIPTION_MAX_LENGTH } from "@/lib/evidence/schemas";

const INVALID_IMAGE_MESSAGE =
  "That image could not be accepted. Upload a JPEG, PNG or WebP image under 5 MB.";
const SUBMISSION_ERROR_MESSAGE =
  "We couldn't save your evidence right now. Your official receipt information has not been affected.";

export function AddEvidenceFlow({
  receiptId,
  projectTitle,
  defaultAreaCouncil,
}: {
  receiptId: string;
  projectTitle: string;
  defaultAreaCouncil: FctAreaCouncil | null;
}) {
  const [step, setStep] = useState(1);
  const [observationType, setObservationType] = useState<EvidenceObservationType | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [areaCouncil, setAreaCouncil] = useState<FctAreaCouncil | "">(
    defaultAreaCouncil ?? "",
  );
  const [locality, setLocality] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function continueFromObservation() {
    if (!observationType) {
      setError("Choose what you observed before continuing.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function continueFromDetails() {
    if (description.length > EVIDENCE_DESCRIPTION_MAX_LENGTH) {
      setError(`Description must be ${EVIDENCE_DESCRIPTION_MAX_LENGTH} characters or fewer.`);
      return;
    }
    setError(null);
    setStep(3);
  }

  function continueFromLocation() {
    if (!areaCouncil) {
      setError("Choose an Area Council before continuing.");
      return;
    }
    setError(null);
    setStep(4);
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (
      file &&
      (file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    ) {
      setImage(null);
      setPreviewUrl(null);
      event.target.value = "";
      setError(INVALID_IMAGE_MESSAGE);
      return;
    }
    setError(null);
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!observationType || !areaCouncil || !acknowledged) {
      setError("Confirm that you understand how this community report will be classified.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const body = new FormData();
    body.set("observationType", observationType);
    body.set("description", description);
    body.set("areaCouncil", areaCouncil);
    body.set("locality", locality);
    body.set("approximateLat", "");
    body.set("approximateLng", "");
    body.set("acknowledgement", "true");
    if (image) body.set("image", image);

    try {
      const response = await fetch(`/api/receipt/${encodeURIComponent(receiptId)}/evidence`, {
        method: "POST",
        body,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const code =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String(payload.error)
            : "submission_unavailable";
        throw new Error(code === "invalid_image" ? INVALID_IMAGE_MESSAGE : SUBMISSION_ERROR_MESSAGE);
      }
      setSubmitted(true);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : SUBMISSION_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section aria-labelledby="evidence-received-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9" data-testid="evidence-confirmation">
        <CheckCircle2 aria-hidden="true" className="size-9 text-[var(--community)]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--community)]">Evidence received</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight" id="evidence-received-heading">
          Thank you. Your observation has been recorded as community evidence.
        </h1>
        <div className="mt-7 flex flex-wrap gap-2">
          <EvidenceBadge type="community" />
          <EvidenceBadge type="unverified" />
          <span className="inline-flex min-h-9 items-center rounded-full bg-amber-50 px-3 text-xs font-bold tracking-[0.08em] text-[var(--caution)]">
            PENDING REVIEW
          </span>
        </div>
        <p className="mt-6 max-w-2xl leading-7 text-[var(--muted)]">
          It has not been independently verified and will not change the official project record automatically.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white" href={`/receipt/${receiptId}`}>
            Back to Receipt
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold" href={`/receipt/${receiptId}/source`}>
            View official source
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold" href={`/receipt/${receiptId}/share`}>
            Share Receipt
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8" onSubmit={submit}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--community)]">Add evidence</p>
        <p className="text-sm text-[var(--muted)]">Step {step} of 4</p>
      </div>

      {step === 1 ? (
        <fieldset className="mt-7">
          <legend className="text-2xl font-semibold tracking-tight">What did you observe?</legend>
          <div className="mt-6 grid gap-3">
            {EVIDENCE_OBSERVATION_TYPES.map((value) => (
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4" key={value}>
                <input checked={observationType === value} name="observation" onChange={() => setObservationType(value)} type="radio" value={value} />
                <span className="font-medium">{EVIDENCE_OBSERVATION_LABELS[value]}</span>
              </label>
            ))}
          </div>
          <button className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white" onClick={continueFromObservation} type="button">
            Continue <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </fieldset>
      ) : null}

      {step === 2 ? (
        <section aria-labelledby="evidence-details-heading" className="mt-7">
          <h2 className="text-2xl font-semibold tracking-tight" id="evidence-details-heading">Show us what you saw</h2>
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-[var(--caution)]">
            Avoid images that unnecessarily expose private individuals, children, personal documents, licence plates or sensitive locations.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">Your submission will not be treated as verified automatically.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="evidence-photo">Add a photo <span className="font-normal text-[var(--muted)]">(optional)</span></label>
          <input accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm" id="evidence-photo" onChange={chooseImage} type="file" />
          <p className="mt-2 text-xs text-[var(--muted)]">JPEG, PNG or WebP, up to 5 MB.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="evidence-description">Tell us what you observed <span className="font-normal text-[var(--muted)]">(optional)</span></label>
          <textarea aria-describedby="description-limit" className="mt-2 min-h-32 w-full rounded-xl border border-[var(--border)] bg-white p-3" id="evidence-description" maxLength={EVIDENCE_DESCRIPTION_MAX_LENGTH} onChange={(event) => setDescription(event.target.value)} value={description} />
          <p className="mt-2 text-right text-xs tabular-nums text-[var(--muted)]" id="description-limit">{description.length}/{EVIDENCE_DESCRIPTION_MAX_LENGTH}</p>
          <StepActions back={() => setStep(1)} next={continueFromDetails} />
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-labelledby="evidence-location-heading" className="mt-7">
          <h2 className="text-2xl font-semibold tracking-tight" id="evidence-location-heading">Where did you observe this?</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">Choose an approximate area. Precise GPS is not required or displayed publicly.</p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="evidence-area-council">Area Council</label>
          <select className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3" id="evidence-area-council" onChange={(event) => setAreaCouncil(event.target.value as FctAreaCouncil | "")} required value={areaCouncil}>
            <option value="">Choose an Area Council</option>
            {FCT_AREA_COUNCILS.map((council) => <option key={council} value={council}>{council}</option>)}
          </select>
          <label className="mt-6 block text-sm font-semibold" htmlFor="evidence-locality">Locality / community <span className="font-normal text-[var(--muted)]">(optional)</span></label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3" id="evidence-locality" maxLength={120} onChange={(event) => setLocality(event.target.value)} type="text" value={locality} />
          <StepActions back={() => setStep(2)} next={continueFromLocation} />
        </section>
      ) : null}

      {step === 4 && observationType && areaCouncil ? (
        <section aria-labelledby="review-submission-heading" className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--community)]">Review your submission</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="review-submission-heading">Check what you are sharing</h2>
          <dl className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            <ReviewRow label="Project" value={projectTitle} />
            <ReviewRow label="Observation" value={EVIDENCE_OBSERVATION_LABELS[observationType]} />
            <ReviewRow label="Description" value={description || "Not supplied"} />
            <ReviewRow label="Location" value={[locality, areaCouncil].filter(Boolean).join(", ")} />
          </dl>
          {previewUrl ? (
            <div className="mt-6">
              <p className="text-sm font-semibold">Photo</p>
              <Image alt="Selected evidence preview" className="mt-2 max-h-64 w-auto rounded-xl object-contain" height={320} src={previewUrl} unoptimized width={480} />
            </div>
          ) : null}
          <div className="mt-7 rounded-xl bg-[#f3f1eb] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em]">How this will be classified</p>
            <div className="mt-4 flex flex-wrap gap-2"><EvidenceBadge type="community" /><EvidenceBadge type="unverified" /></div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">This submission will not change the official project record automatically.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">It will remain pending until it is reviewed or otherwise corroborated.</p>
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-4">
            <input checked={acknowledged} className="mt-1" onChange={(event) => setAcknowledged(event.target.checked)} type="checkbox" />
            <span className="text-sm leading-6">I understand that this is a community report and is not automatically verified.</span>
          </label>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-semibold" disabled={submitting} onClick={() => setStep(3)} type="button"><ArrowLeft aria-hidden="true" className="size-4" /> Back</button>
            <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white disabled:opacity-60" disabled={!acknowledged || submitting} type="submit">{submitting ? "Submitting evidence…" : "Submit Evidence"}</button>
          </div>
        </section>
      ) : null}

      <div aria-live="polite" className="mt-5 min-h-6">
        {error ? <p className="text-sm text-[var(--disputed)]" role="alert">{error}</p> : null}
      </div>
    </form>
  );
}

function StepActions({ back, next }: { back: () => void; next: () => void }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
      <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-semibold" onClick={back} type="button"><ArrowLeft aria-hidden="true" className="size-4" /> Back</button>
      <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white" onClick={next} type="button">Continue <ArrowRight aria-hidden="true" className="size-4" /></button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value}</dd></div>;
}
