package app.controllers;

import java.util.List;

import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
import org.javalite.activeweb.AppController;
import org.javalite.common.JsonHelper;
import org.javalite.instrumentation.Instrumentation;

public class BasicController extends AppController {
	
	public BasicController() {
		super();
		try {
			Instrumentation instrumentation = new Instrumentation();
			String path = this.getRealPath("");
			System.out.println(path+"/WEB-INF/classes");
			instrumentation.setOutputDirectory(path+"/WEB-INF/classes");
			instrumentation.instrument();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		Base.open("com.mysql.jdbc.Driver", "jdbc:mysql://localhost:3306/jk?useUnicode=true&characterEncoding=UTF-8", "root", "qweqwe");
	}
		
	public Object[] toArray(List <Model> inList)
	{
		Object[] res = new Object[inList.size()];
		for(int i=0; i<inList.size(); i++)
		{
			Model m = inList.get(i);
			res[i] = m.toMap();
		}
        return res;
	}
	
	public void toJSON(Object in)
	{
        String json = JsonHelper.toJsonString(in);
		respond(json).contentType("text/plain;charset=UTF-8");
	}
}
