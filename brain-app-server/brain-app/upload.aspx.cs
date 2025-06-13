using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using System.IO;
using System.IO.Compression;


namespace brain_app_server.brain_app
{
    public partial class upload : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string ip = Request.UserHostAddress;
            string filename = Guid.NewGuid().ToString();
            if ((ip != null) && (!ip.Contains("::"))) filename += ("_" + ip);

            string fileText = Request.Form["fileText"];
            string type = Request.Form["type"];
                        
            string path;

            string pathgz;
            if(type == "model")
            {
                filename += ("_" + type + ".obj");
            } else
            {
                filename += ("_" + type + ".txt");
            }

            path = Server.MapPath("save") + "\\" + filename;
            pathgz = Server.MapPath("save") + "\\" + filename + ".gz";

            using (FileStream compressedFileStream = File.Create(pathgz))
            {
                using (GZipStream compressionStream = new GZipStream(compressedFileStream,
                   CompressionMode.Compress))
                {
                    using (StreamWriter writer = new StreamWriter(compressionStream))
                    {
                        writer.Write(fileText);
                    }
                }
            }


            //try
            //{
            //    System.IO.File.WriteAllText(path, fileText);
            //}
            //catch
            //{
            //}

            Response.Write(filename);
        }
    }
}