export class GlobalResponseDto {
  code: string;
  message: string;
  data: any;

  constructor(code: string, message: string, data: any) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
