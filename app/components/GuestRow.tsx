"use client";

import { useState } from "react";

type Guest = {
  id: string;
  fullName: string;
  phoneNumber: string;
  invite: { id: string; status: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  NOT_CHECKED_IN: "Not Checked In",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
};

const STATUS_STYLE: Record<string, string> = {
  NOT_CHECKED_IN: "bg-[#F1EEE7] text-[#7A6F63]",
  CHECKED_IN: "bg-[#4B7A5B]/10 text-[#3E6A4C]",
  CHECKED_OUT: "bg-[#57647A]/10 text-[#57647A]",
};

const inputClass =
  "border border-[#2E2A24]/20 rounded-sm px-3 py-1.5 text-sm text-[#2E2A24] bg-white placeholder:text-[#2E2A24]/30 focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57] transition-colors";

const actionBtn =
  "text-[11px] tracking-[0.08em] uppercase font-bold px-3 py-1.5 rounded-sm border transition-colors whitespace-nowrap";

export default function GuestRow({
  guest,
  editGuest,
  deleteGuest,
  sendInvite,
  manualCheckIn,
  manualCheckOut,
}: {
  guest: Guest;
  editGuest: (formData: FormData) => Promise<void>;
  deleteGuest: (formData: FormData) => Promise<void>;
  sendInvite: (formData: FormData) => Promise<void>;
  manualCheckIn: (formData: FormData) => Promise<void>;
  manualCheckOut: (formData: FormData) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isEditing) {
    return (
      <li className="border border-[#B08D57]/40 bg-[#B08D57]/[0.04] rounded-sm p-4">
        <form
          action={async (formData) => {
            await editGuest(formData);
            setIsEditing(false);
          }}
          className="flex gap-2 flex-wrap items-center"
        >
          <input type="hidden" name="guestId" value={guest.id} />
          <input
            name="fullName"
            defaultValue={guest.fullName}
            required
            className={`${inputClass} flex-1 min-w-[10rem]`}
          />
          <input
            name="phoneNumber"
            defaultValue={guest.phoneNumber}
            required
            className={`${inputClass} flex-1 min-w-[10rem]`}
          />
          <button
            className={`${actionBtn} bg-[#2E2A24] border-[#2E2A24] text-white hover:bg-[#B08D57] hover:border-[#B08D57]`}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-[11px] tracking-[0.08em] uppercase font-bold text-[#7A6F63] hover:text-[#2E2A24] transition-colors"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  const status = guest.invite?.status ?? "NOT_CHECKED_IN";

  return (
    <li className="border border-[#2E2A24]/12 bg-white rounded-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-[#2E2A24] text-sm truncate">
          {guest.fullName}
        </p>
        <p className="text-xs text-[#7A6F63] mt-0.5">{guest.phoneNumber}</p>
        <span
          className={`inline-block mt-2 text-[10px] tracking-[0.08em] uppercase font-bold px-2 py-1 rounded-sm ${STATUS_STYLE[status]}`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:justify-end">
        <form action={sendInvite}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button
            className={`${actionBtn} border-[#3E6A4C]/30 text-[#3E6A4C] hover:bg-[#3E6A4C] hover:text-white hover:border-[#3E6A4C]`}
          >
            Send WhatsApp
          </button>
        </form>

        <form action={manualCheckIn}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button
            className={`${actionBtn} bg-[#2E2A24] border-[#2E2A24] text-white hover:bg-[#B08D57] hover:border-[#B08D57]`}
          >
            Check In
          </button>
        </form>

        <form action={manualCheckOut}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button
            className={`${actionBtn} border-[#2E2A24]/25 text-[#2E2A24] hover:border-[#2E2A24] hover:bg-[#2E2A24]/[0.04]`}
          >
            Check Out
          </button>
        </form>

        <button
          onClick={() => setIsEditing(true)}
          className={`${actionBtn} border-[#B08D57]/40 text-[#8A6B3F] hover:bg-[#B08D57] hover:text-white hover:border-[#B08D57]`}
        >
          Edit
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <form action={deleteGuest}>
              <input type="hidden" name="guestId" value={guest.id} />
              <button
                className={`${actionBtn} bg-[#9A4B3F] border-[#9A4B3F] text-white hover:bg-[#7E3C32] hover:border-[#7E3C32]`}
              >
                Confirm Delete
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] tracking-[0.08em] uppercase font-bold text-[#7A6F63] hover:text-[#2E2A24] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className={`${actionBtn} border-[#9A4B3F]/30 text-[#9A4B3F] hover:bg-[#9A4B3F] hover:text-white hover:border-[#9A4B3F]`}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
