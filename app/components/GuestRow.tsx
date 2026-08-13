"use client";

import { useState } from "react";

type Guest = {
  id: string;
  fullName: string;
  phoneNumber: string;
  invite: { id: string; status: string } | null;
};

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
      <li className="border rounded p-3">
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
            className="border rounded px-2 py-1"
          />
          <input
            name="phoneNumber"
            defaultValue={guest.phoneNumber}
            required
            className="border rounded px-2 py-1"
          />
          <button className="text-sm bg-black text-white px-3 py-1 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-500 underline"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="border rounded p-3 flex justify-between items-center flex-wrap gap-2">
      <span>
        {guest.fullName} — {guest.phoneNumber}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">
          Status: {guest.invite?.status}
        </span>

        <form action={sendInvite}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button className="text-sm bg-green-600 text-white px-3 py-1 rounded">
            Send via WhatsApp
          </button>
        </form>

        <form action={manualCheckIn}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
            Manual Check-In
          </button>
        </form>

        <form action={manualCheckOut}>
          <input type="hidden" name="inviteId" value={guest.invite?.id} />
          <button className="text-sm bg-gray-600 text-white px-3 py-1 rounded">
            Manual Check-Out
          </button>
        </form>

        <button
          onClick={() => setIsEditing(true)}
          className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Edit
        </button>

        {confirmDelete ? (
          <form action={deleteGuest} className="flex items-center gap-1">
            <input type="hidden" name="guestId" value={guest.id} />
            <button className="text-sm bg-red-600 text-white px-3 py-1 rounded">
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-gray-500 underline"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}