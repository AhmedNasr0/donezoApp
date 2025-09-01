import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import React from "react"

export const ProcessingOverlay = ({ status }: { status: string }) => {
  const [showCompleted, setShowCompleted] = React.useState(false)

  React.useEffect(() => {
    if (status === "done") {
      setShowCompleted(true)
      const timer = setTimeout(() => setShowCompleted(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [status])


  const isProcessing = status === "processing"
  const isFailed = status === "failed"

  return (
    <AnimatePresence>
      {(isProcessing || showCompleted || isFailed) && (
        <motion.div
          className={`absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none 
            ${showCompleted ? "bg-green-500/80" : isFailed ? "bg-red-500/80" : "bg-black/50"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isProcessing && !showCompleted && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-white text-sm">Transcription...</span>
            </div>
          )}

          {showCompleted && (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
          )}

          {isFailed && (
            <motion.div
              key="failed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <XCircle className="w-10 h-10 text-white" />
              <span className="text-white text-sm">Please remove and try again</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
