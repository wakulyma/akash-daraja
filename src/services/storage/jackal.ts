import fs from "fs";
import { Deposit } from "../../models/Deposit";
import {
  FileUploadHandler,
  MnemonicWallet,
  WalletHandler,
} from "@jackallabs/jackal.nodejs";
import { config } from "../../config/config";

//occasionally backs up db into jackal protocol
export const dumpDB = async () => {
  try {
    let depositDocuments = await Deposit.find();

    let timeNow = Date.now();

    //write backup file
    fs.writeFile(
      `./${timeNow}_db_state.txt`,
      depositDocuments.toString(),
      (err) => {
        console.log("error dumping db deposits state", err);
      }
    );

    //instantiate wallet
    const appConfig = {
      signerChain: "lupulella-2",
      queryAddr: "https://testnet-grpc.jackalprotocol.com",
      txAddr: "https://testnet-rpc.jackalprotocol.com",
    };

    const m = await MnemonicWallet.create(config.COSMOS_MNEMONIC);

    const w = await WalletHandler.trackWallet(appConfig, m);

    const fileIo = await w.makeFileIoHandler("1.1.x");

    if (!fileIo) throw new Error("no FileIo Intialized @dumpDB");

    const buffer = Buffer.from(depositDocuments.toString(), "utf8");

    let fileName = `${timeNow}_db_state`;

    const fileToUpload = new File([buffer], fileName, {
      type: "text/plain",
    });

    const directory = await fileIo.downloadFolder("s/backups/");

    const uploader = await FileUploadHandler.trackFile(
      fileToUpload,
      directory.getMyPath()
    );

    const uploadList = {
      fileName: {
        data: null,
        exists: false,
        handler: uploader,
        key: fileName,
        uploadable: await uploader.getForUpload(),
      },
    };

    let uploadStatus = await fileIo.staggeredUploadFiles(
      uploadList,
      directory,
      {
        timer: 0,
        complete: 0,
      }
    );

    return uploadStatus;
  } catch (error) {}
};
