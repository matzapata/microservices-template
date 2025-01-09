export interface IMailTransmissionResult {
  success: boolean;
  message: string;
}

export interface IMail {
  sourceAddress: string;
  destinationAddress: string;
  messageTitle: string;
  messageBody: string;
  replyToAddress?: string;
}

export interface IEmailService {
  sendMail(mail: IMail): Promise<IMailTransmissionResult>;
}

class NodemailerEmailService implements IEmailService {
  sendMail(mail: IMail): Promise<IMailTransmissionResult> {
    throw new Error("Method not implemented." + JSON.stringify(mail));
  }
}

export const EmailService: IEmailService = new NodemailerEmailService();
