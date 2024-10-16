using System;
using System.Web.UI;
using System.IO;
using System.Web.UI.WebControls;

namespace brain_app_server.brain_app
{
    public partial class getapp : Page
    {
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
                    
                    json = File.ReadAllText(savePath + "\\" + filename);
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