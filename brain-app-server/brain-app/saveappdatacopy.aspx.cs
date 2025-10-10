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
        protected void Page_Load(object sender, EventArgs e)
        {
            string ip = Request.UserHostAddress;
            string guid = Guid.NewGuid().ToString();
            if ((ip != null) && (!ip.Contains("::"))) guid += ("_" + ip);
            string saveString = Request.Form["save"];
            string path = Server.MapPath("save") + "\\" + guid + ".txt";

            string guidAppDataArray = Guid.NewGuid().ToString();
            if ((ip != null) && (!ip.Contains("::"))) guidAppDataArray += ("_" + ip);
            string appDataArrayString = Request.Form["appDataArray"];
            string appDataArrayPath = Server.MapPath("save") + "\\" + guidAppDataArray + ".txt";

            string guidUploadedModels = Guid.NewGuid().ToString();
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
            string indexguid = Guid.NewGuid().ToString();
            string indexPath = Server.MapPath("save") + "\\index_" + indexguid + ".txt";

            // write an index to the three files we just saved

            try
            {
                System.IO.File.WriteAllText(indexPath, (guid + ":" + guidAppDataArray + ":" + guidUploadedModels));
            }
            catch
            {
            }

            Response.Write(indexguid);
        }
    }
}