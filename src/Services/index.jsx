// Vaca Service exports - previously empty, now implemented
export {
  createVaca,
  getVacaDetails,
  addVacaTransaction,
  updateVaca,
  deleteVaca,
  getVacaStats,
  checkTablesExist
} from './vacaService.jsx';


export {
  searchUsers,
  updateUserProfile,
  getUserProfile,
  getUserProfiles,
  uploadAvatar,
  deleteAvatar,
  getUserStats,
  getUserVacas,
  updateUserPreferences,
  getUserPreferences,
  deleteUserAccount,
  exportUserData
} from './userService.jsx';

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
} from '../Services/transactionService.new.jsx';

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
} from '../Services/expenseService.jsx';


export {
  getVacaParticipants,
  getActiveParticipants,
  getPendingParticipants,
  getPageableParticipants,
  getUserParticipations,
  getParticipantByEmail,
  getParticipantContributions,
  createParticipant,
  updateParticipant,
  updateParticipantStatus,
  activateParticipant,
  deactivateParticipant,
  removeParticipant,
  bulkInviteParticipants,
  getParticipants,
  addParticipant,
  getParticipantBalance,
  calculateExitDistribution,
  processParticipantExit,
  getParticipantTransactions,
  getParticipantStats
} from '../Services/participantService.jsx';

// Invitation Service exports
export {
  createInvitations,
  createInvitations as inviteParticipants, // Alias for compatibility
  getUserInvitations,
  getUserInvitations as getInvitations, // Alias for compatibility
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
} from '../Services/voteService.jsx';

export { default as apiService } from '../Services/apiService.jsx';
export * from './notificationService.jsx';

