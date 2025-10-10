using System;
using System.IO;
using System.IO.Compression;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace brain_app_server.brain_app
{
    public partial class deleteappdatacopy : Page
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
            try
            {
                //System.Diagnostics.Debug.WriteLine(filename);
                //if(filename.StartsWith("index_"))
                //{
                //    // new method, file is an index
                //    string indexString = readFile(savePath + "\\" + filename);
                //    string[] subs = indexString.Split(':');
                //    string saveFilePath = subs[0];
                //    string appDataFilePath = subs[1];
                //    string uploadedModelPath = subs[2];

                //    string saveFileContents = readFile(savePath + "\\" + saveFilePath + ".txt");
                //    string appDataFileContents = readFile(savePath + "\\" + appDataFilePath + ".txt");
                //    string uploadedModelFileContents = readFile(savePath + "\\" + uploadedModelPath + ".txt");

                //    json = "{\"saveFileContents\":" + saveFileContents +
                //        ",\"appDataFileContents\":" + appDataFileContents +
                //        ",\"uploadedModelFileContents\":" + uploadedModelFileContents + "}";
                //}
                if (filename.StartsWith("index_"))
                {
                    string indexString = readFile(savePath + "\\" + filename);
                    string indexFile = savePath + "\\" + filename.Substring(8);
                    string[] subs = indexString.Split(':');
                    string saveFilePath = subs[0];
                    string appDataFilePath = subs[1];
                    string uploadedModelPath = subs[2];

                    try
                    {
                        File.Delete(savePath + "\\" + saveFilePath + ".txt");
                        System.Diagnostics.Debug.WriteLine(saveFilePath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + saveFilePath + ".txt.gz");
                        System.Diagnostics.Debug.WriteLine(saveFilePath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + appDataFilePath + ".txt");
                        System.Diagnostics.Debug.WriteLine(appDataFilePath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + appDataFilePath + ".txt.gz");
                        System.Diagnostics.Debug.WriteLine(appDataFilePath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + uploadedModelPath + ".txt");
                        System.Diagnostics.Debug.WriteLine(uploadedModelPath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + uploadedModelPath + ".txt.gz");
                        System.Diagnostics.Debug.WriteLine(uploadedModelPath);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    try
                    {
                        File.Delete(savePath + "\\" + filename);
                        System.Diagnostics.Debug.WriteLine(savePath + "\\" + filename);
                    }
                    catch (FileNotFoundException error)
                    {
                        System.Diagnostics.Debug.WriteLine(error.Message);
                    }
                    //else
                    //{
                    //    json = readFile(savePath + "\\" + filename);
                    //}
                    json = "data deleted";

                } else
                {
                    json = "Will not delete old visualisation data, can only delete data copied to the server with the new index method";
                }
            }
            catch (FileNotFoundException error)
            {
                System.Diagnostics.Debug.WriteLine("Failed to find " + filename + ": " + error.Message);
                json = "error";
            }
            Response.Write(json);
        }
    }
}