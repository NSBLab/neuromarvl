using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace brain_app_server.brain_app
{
    public partial class saveappdatacopy : System.Web.UI.Page
    {
        private void SaveCompressedFile(string path, string contents)
        {
            using (FileStream compressedFileStream = File.Create(path))
            {
                using (GZipStream compressionStream = new GZipStream(compressedFileStream,
                   CompressionMode.Compress))
                {
                    using (StreamWriter writer = new StreamWriter(compressionStream))
                    {
                        writer.Write(contents);
                    }
                }
            }
        }

        private string GetUniqueFileName(string path)
        {
            while(true)
            {
                string guid = Guid.NewGuid().ToString();
                string[] fileList = Directory.GetFiles(path, "*" + guid + "*");
                if (fileList.Length == 0)
                {
                    return guid;
                }
            }
        }


        protected void Page_Load(object sender, EventArgs e)
        {
            string guid = GetUniqueFileName(Server.MapPath("save"));
            string ip = Request.UserHostAddress;
            
            if ((ip != null) && (!ip.Contains("::"))) guid += ("_" + ip);
            string saveString = Request.Form["save"];
            string path = Server.MapPath("save") + "\\" + guid + ".txt";

            string guidAppDataArray = GetUniqueFileName(Server.MapPath("save"));
            if ((ip != null) && (!ip.Contains("::"))) guidAppDataArray += ("_" + ip);
            string appDataArrayString = Request.Form["appDataArray"];
            string appDataArrayPath = Server.MapPath("save") + "\\" + guidAppDataArray + ".txt";

            string guidUploadedModels = GetUniqueFileName(Server.MapPath("save"));
            if ((ip != null) && (!ip.Contains("::"))) guidUploadedModels += ("_" + ip);
            string uploadedModelsString = Request.Form["uploadedModels"];
            string uploadedModelsPath = Server.MapPath("save") + "\\" + guidUploadedModels + ".txt";
            
            SaveCompressedFile(appDataArrayPath + ".gz", appDataArrayString);
            SaveCompressedFile(uploadedModelsPath + ".gz", uploadedModelsString);


            try
            {
                System.IO.File.WriteAllText(path, saveString);
            }
            catch
            {
            }
            string indexguid = GetUniqueFileName(Server.MapPath("save"));
            string indexPath = Server.MapPath("save") + "\\index_" + indexguid + ".txt";

            // write an index to the three files we just saved

            try
            {
                System.IO.File.WriteAllText(indexPath, (guid + ":" + guidAppDataArray + ":" + guidUploadedModels));
            }
            catch
            {
            }

            string canDelete = Request.Form["canDelete"];
            System.Diagnostics.Debug.WriteLine(canDelete);
            string deleteguid;
            if (canDelete == "true")
            {
                deleteguid = GetUniqueFileName(Server.MapPath("save"));
                string deletePath = Server.MapPath("save") + "\\delete_" + deleteguid + ".txt";

                try
                {
                    System.IO.File.WriteAllText(deletePath, indexguid);
                }
                catch
                {
                }
            }
            else
            {
                deleteguid = "junk";
            }

            Response.Write(indexguid + " " + deleteguid);
        }
    }
}