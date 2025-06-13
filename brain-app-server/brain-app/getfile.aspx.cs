using System;
using System.IO;
using System.IO.Compression;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace brain_app_server.brain_app
{
    public partial class getfile : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string filename = Request.Form["filename"];
            string savePath = Server.MapPath("save");
            string examplePath = Server.MapPath("save_examples");
            string json = "";

            if (!Directory.Exists(savePath))
            {
                Directory.CreateDirectory(savePath);
            }
            //# System.Diagnostics.Debug.WriteLine("filename:" + Request.Form["filename"] + ".txt");
            //System.Diagnostics.Debug.WriteLine("source:" + Request.Form["source"]);

            
            try
            {
                if (Request.Form["source"] == "example")
                {
                    foreach (string file in Directory.GetFiles(examplePath, "*.txt"))
                    {
                        string newFile = savePath + file.Substring(examplePath.Length);
                        System.Diagnostics.Debug.WriteLine("Moving example file " + file + " to " + newFile);
                        if (!File.Exists(newFile)) File.Copy(file, newFile);
                    }
                    json = File.ReadAllText(examplePath + "\\" + filename);
                }
                else
                {
                    if (File.Exists(savePath + "\\" + filename))
                    {
                        json = File.ReadAllText(savePath + "\\" + filename);
                    } 
                    else if(File.Exists(savePath + "\\" + filename + ".gz"))
                    {
                        System.Diagnostics.Debug.WriteLine(savePath + "\\" + filename + ".gz");
                        using (FileStream fInStream = new FileStream(savePath + "\\" + filename + ".gz",
                            FileMode.Open, FileAccess.Read))
                        {
                            using (GZipStream zipStream = new GZipStream(fInStream, CompressionMode.Decompress))
                            {
                                using (StreamReader unzip = new StreamReader(zipStream))
                                {
                                    json = unzip.ReadToEnd();
                                }
                            }
                        }
                    }
                }
            }
            catch (FileNotFoundException error)
            {
                System.Diagnostics.Debug.WriteLine("Failed to find " + filename + ": " + error.Message);
            }

            Response.Write(json);
        }
    }
}