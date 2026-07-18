class EmailService {
  async sendTrainingAssignedEmail(studentEmail: string, mentorEmail: string) {
    console.log(`[MOCK EMAIL] To: ${studentEmail} | Subject: Training Assigned`);
    console.log(`[MOCK EMAIL] Body: You have been assigned a training module. Mentor: ${mentorEmail}`);
    return Promise.resolve(true);
  }

  async sendTrainingStartedEmail(studentEmail: string) {
    console.log(`[MOCK EMAIL] To: ${studentEmail} | Subject: Training Started`);
    console.log(`[MOCK EMAIL] Body: Your training has officially started. Good luck!`);
    return Promise.resolve(true);
  }

  async sendTrainingCompletedEmail(studentEmail: string, tecEmail: string, adminEmail: string) {
    console.log(`[MOCK EMAIL] To: ${studentEmail}, ${tecEmail}, ${adminEmail} | Subject: Training Completed`);
    console.log(`[MOCK EMAIL] Body: The student has completed their training successfully. Sending back to TEC Cell.`);
    return Promise.resolve(true);
  }
}

const emailService = new EmailService();
export default emailService;
