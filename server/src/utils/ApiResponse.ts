class ApiResponse<T = unknown> {
  statuscode: number;
  data: T;
  messege: string;
  success: boolean;

  constructor(statuscode: number, data: T, messege = "Success") {
    this.statuscode = statuscode;
    this.data = data;
    this.messege = messege;
    this.success = statuscode < 400;
  }
}

export { ApiResponse };
