package app.controllers;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.javalite.activejdbc.Model;
import org.javalite.activeweb.annotations.POST;

import app.models.Med;

public class MedicineController extends BasicController {

	public void index() {
		System.out.println('s');
		respond("index function for ActiveJDBC.").contentType("text/plain").status(200);
	}

	public void search() {
		long total = Med.count();

		int pageSize = Integer.parseInt(param("limit"));
		int offset = Integer.parseInt(param("offset"));
		String kw = param("search");
		System.out.println(kw);
		List<Model> resList = Med.where("NAME LIKE ?", "%" + kw + "%").limit(pageSize).offset(offset)
				.orderBy("ID desc");
		Object[] data = toArray(resList);

		Map<String, Object> res = new HashMap<String, Object>();
		res.put("total", total);
		res.put("rows", data);

		toJSON(res);
	}

	@POST
	public void save() throws Exception {
		try {
			Map<String, Object> rs = new HashMap<String, Object>();
			Map params = params1st();
			int id = Integer.parseInt(param("ID"));
			if (id == 0) {
				params.remove("ID");
			}
			Med m = new Med();
			m.fromMap(params);
			if (m.save()) {
				rs.put("code", 0);
			} else {
				rs.put("code", 100001);
				rs.put("data", "����ʱ��������");
			}
			toJSON(rs);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public void remove() {
		int id = Integer.parseInt(param("ids"));
		Med.delete("ID=?", id);

		Map<String, Object> rs = new HashMap<String, Object>();
		rs.put("code", 0);
		toJSON(rs);
	}
}
