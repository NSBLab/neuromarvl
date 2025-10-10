using System;
using System.IO;
using System.IO.Compression;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace brain_app_server.brain_app
{
    public partial class getappdatacopy : Page
    {
        private string readFile(string fileName)
        {
            if (File.Exists(fileName))
            {
                return File.ReadAllText(fileName);
            }
            else if (File.Exists(fileName + ".gz"))
            {
                using (FileStream fInStream = new FileStream(fileName + ".gz",
                    FileMode.Open, FileAccess.Read))
                {
                    using (GZipStream zipStream = new GZipStream(fInStream, CompressionMode.Decompress))
                    {
                        using (StreamReader unzip = new StreamReader(zipStream))
                        {
                            while (!unzip.EndOfStream)
                            {
                                return unzip.ReadToEnd();
                            }
                        }
                    }
                }
            }
            return "";
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            string filename = Request.Form["filename"] + ".txt";
            string savePath = Server.MapPath("save");
            string examplePath = Server.MapPath("save_examples");
            string json = "";

            if (!Directory.Exists(savePath))
            {
                Directory.CreateDirectory(savePath);
            }
            //# System.Diagnostics.Debug.WriteLine("filename:" + Request.Form["filename"] + ".txt");
            System.Diagnostics.Debug.WriteLine("source:" + Request.Form["source"]);
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
                    if(filename.StartsWith("index_"))
                    {
                        // new method, file is an index
                        string indexString = readFile(savePath + "\\" + filename);
                        string[] subs = indexString.Split(':');
                        string saveFilePath = subs[0];
                        string appDataFilePath = subs[1];
                        string uploadedModelPath = subs[2];

                        string saveFileContents = readFile(savePath + "\\" + saveFilePath + ".txt");
                        string appDataFileContents = readFile(savePath + "\\" + appDataFilePath + ".txt");
                        string uploadedModelFileContents = readFile(savePath + "\\" + uploadedModelPath + ".txt");

                        json = "{\"saveFileContents\":" + saveFileContents +
                            ",\"appDataFileContents\":" + appDataFileContents +
                            ",\"uploadedModelFileContents\":" + uploadedModelFileContents + "}";
                    }
                    else
                    {
                        json = readFile(savePath + "\\" + filename);
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