import type { AccountRepository } from "@/modules/account/business/repository/accountRepository/AccountRepository";
import type { ApiResponse } from "@/types/api";
import type { LoginDTO, LoginResponseData } from "@/types/auth";

export class AccountController {
  constructor(private readonly repository: AccountRepository) {}

  login(dto: LoginDTO): Promise<ApiResponse<LoginResponseData>> {
    return this.repository.login(dto);
  }
}
