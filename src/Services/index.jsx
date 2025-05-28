



// Vaca Service exports - usando versión nueva con API
export {
  inviteParticipants,
  getInvitations,
  checkTablesExist,
  createVaca,
  getUserVacas,
  getVacaDetails,
  addVacaTransaction,
  updateVaca,
  deleteVaca,
  getVacaParticipants,
  addVacaParticipant,
  removeVacaParticipant,
  getVacaStats,
  closeVaca,
  reopenVaca
} from './vacaService.new.jsx';

// User Service exports
export {
  searchUsers,
  updateUserProfile,
  getUserProfile,
  getUserProfiles,
  uploadAvatar,
  deleteAvatar,
  getUserStats,
  updateUserPreferences,
  getUserPreferences,
  deleteUserAccount,
  exportUserData
} from './userService.new.jsx';

// Transaction Service exports
export {
  getTransactionTypes,
  createTransaction,
  getUserTransactions,
  getVacaTransactions,
  getTransactionDetails,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  rejectTransaction,
  uploadReceipt,
  deleteReceipt,
  downloadReceipt,
  getTransactionSummary,
  getPendingTransactions,
  createBatchTransactions,
  getTransactionStats
} from './transactionService.new.jsx';

// Auth Service exports - usando versión híbrida (Supabase para auth + API para datos)
export {
  getCurrentUser,
  enrichUserData,
  loginUser,
  registerUser,
  logoutUser,
  resendVerificationEmail,
  syncUserProfile,
  onAuthStateChange
} from './authService.jsx';

// Expense Service exports
export {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseDetails,
  uploadExpenseReceipt,
  downloadReceipt as downloadExpenseReceipt,
  deleteExpenseReceipt,
  approveExpense,
  rejectExpense,
  getPendingExpenses,
  getExpensesSummary,
  getExpenseCategories,
  getExpensesStats,
  requestReimbursement,
  processReimbursement
} from './expenseService.jsx';

// Participant Service exports
export {
  getParticipants,
  addParticipant,
  updateParticipant,
  removeParticipant,
  getParticipantBalance,
  calculateExitDistribution,
  processParticipantExit,
  getParticipantTransactions,
  getParticipantStats,
  updateParticipantStatus
} from './participantService.jsx';

// Invitation Service exports
export {
  createInvitations,
  getUserInvitations,
  getSentInvitations,
  getVacaInvitations,
  respondToInvitation,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  resendInvitation,
  getInvitationDetails,
  markInvitationAsRead,
  getInvitationStats
} from './invitationService.jsx';

// Vote Service exports
export {
  createVote,
  getVacaVotes,
  getVoteDetails,
  castVote,
  getVoteCasts,
  updateVote,
  deleteVote,
  closeVote,
  getVoteResult,
  getUserActiveVotes,
  getUserVoteHistory,
  getVoteStats,
  notifyVoteParticipants,
  getVoteRules,
  updateVoteRules
} from './voteService.jsx';


export { default as apiService } from './apiService.jsx';

