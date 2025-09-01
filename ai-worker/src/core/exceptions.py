class TranscriptionException(Exception):
    """Base exception for transcription"""
    pass

class JobNotFound(TranscriptionException):
    """Job not found exception"""
    pass

class TranscriptionFailed(TranscriptionException):
    """Transcription failed exception"""
    pass

class ExternalServiceError(TranscriptionException):
    """External service error"""
    pass