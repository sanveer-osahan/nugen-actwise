import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  /** May return a promise; the dialog stays open and disabled until it settles. */
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

// Modal confirmation. Uses <dialog>.showModal(), so focus stays inside, Esc cancels,
// and the rest of the page is inert while it is open.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={ref}
      className="card modal"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <p className="text-muted">{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy} autoFocus>
          Cancel
        </button>
        <button type="button" className="btn btn-ink btn-sm" onClick={confirm} disabled={busy}>
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
