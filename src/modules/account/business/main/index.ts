import { AccountController } from "@/modules/account/business/controller/accountController/AccountController";
import { AccountRepository } from "@/modules/account/business/repository/accountRepository/AccountRepository";

const accountRepository = new AccountRepository();
const accountController = new AccountController(accountRepository);

export { accountController, accountRepository };
