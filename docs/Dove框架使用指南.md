## Dove���ʹ��ָ�� ##

[TOC]

## 1. ʲô��dove���? ##

	dove�ṩ�˰���Dao ,BaseService��װ�� Cache , ��Ϣ�м�������ŷ��񣬼��(½������)�ȸ��ֹ��ù��ܵĹ���

## 2. �������dove���? ##
	<dependency> 
   		<groupId>com.jumore</groupId>
      	<artifactId>dove</artifactId>
		<!--����汾����ϵ�ܹ���-->
      	<version>1.5.0-SNAPSHOT</version>
 	</dependency>

�����spring�����ļ��м�����������

	<import resource="classpath:dove/dove-*.xml"/>
	<!--Ҳ���Ը�����Ҫ�ֱ�����
	<import resource="classpath:dove/dove-mvc.xml"/>
	<import resource="classpath:dove/dove-dao.xml"/>
	<import resource="classpath:dove/dove-service.xml"/>
	-->
	<bean id="sqlSessionTemplate" class="org.mybatis.spring.SqlSessionTemplate">
		<constructor-arg ref="sqlSessionFactory" />
	</bean>

	<bean id="sqlSessionFactory" class="com.jumore.dove.dao.MySqlSessionFactoryBean">
    	<property name="dataSource" ref="dataSource" />
        <property name="configLocation" value="classpath:mybatis/mybatis-config.xml"></property>
        <!-- mapperɨ�� -->
        <property name="mapperLocations" value="classpath:mybatis/mapper/*/*.xml"></property>
    </bean>

����dove.properties�ļ�,��classpath���½�config/dove.properties�ļ�,���ļ��м�����������(��������)

	#���е����ò�ʹ�õĲ�Ҫɾ�������Խ���Ӧ��ģ������enable=false    
	
    appName=console
    
    enableSOA=false
    soa.appname=console
    soa.registry=zookeeper://192.168.1.51:2181?backup=192.168.1.50:2181,192.168.1.52:2181
    soa.localport=20880
    
    cache.enable=true
    redisNodes=192.168.1.51:7001,192.168.1.51:7002,192.168.1.51:7003,192.168.1.52:7004,192.168.1.52:7005,192.168.1.52:7006
    
    
    shiro.session.timeout=1800
    
    enableMQ=true
    rabbitServers=192.168.1.51:5672,192.168.1.52:5672
    mqUsername=admin
    mqPassword=123456
    
    enableSearch=true
    searchServers=192.168.1.50:9300,192.168.1.52:9300
    esClusterName=es-local
    esIndex=console
    
    enableJob=true
    elastic.job.registry=192.168.1.50:2181,192.168.1.51:2181,192.168.1.52:2181


## 3. ������һ��dao? ##
	ҵ����벻��Ҫ�����Լ���DAO,��ס��һ���Ϳ�����,dove dao�ṩ��һ��ͨ��ʵ��

## 3. ������һ��service? ##

	public interface UserOrderService extends BaseService{
		public void youBizService();
	} 

	public class UserOrderServiceImpl extends BaseServiceImpl implements UserOrderService{
		public void youBizService(){
		}
	}
	������һ�����͵�ҵ��ϵͳ�ж����Լ���Service���룬��Ȼ����Ҫ��UserOrderServiceImpl���ó�һ��spring bean.


## 4. ��ζ���һ��ʵ����? ##

	@Entity //��ע����һ��ʵ���࣬dove dao��save/update���������ע�⣬û�����ע��Ķ��󲻻ᱣ�浽���ݿ�
	@Table(name="user_order");//������ʵ�����Ӧ�����ݿ�����ƣ�Ĭ�Ͽ��Բ��Ӵ�ע�⣬��ôdove daoĬ�Ͻ�������������
	public class UserOrder{
		@Id //��ע���ע��һ�������ֶΣ�ÿһ��ʵ���඼�Ǳ���ģ�ҲӦ����һ���߼�����
		@AutoIncrease //�������������ݿ��������������Ǳ����ע�⣬������ӣ���ô��Ҫ��save֮ǰ��ͨ������Ϊuid��ֵ
		@Sequence //��ע���ʾ�������ɷ�ʽ�������ݿ����в���,��@AutoIncreaseֻ��Ҫһ�����ɣ��������ע�ⶼ�У���@AutoIncrease����
		private Long uid;

		@Column(name="orde_account"); // ���������ݿ��Ӧ���ֶΣ����Ǳ��룬Ĭ��dove dao��ʵ������ֶ�����Ϊ���ݿ��ֶ���ʹ��
		private Integer orderCount;

		//...setter/getter...//
	}
�Դˣ������Ѿ�������һ�����õ�ʵ�����ˣ������ǽ�����һ��

## 5. ������һ��controller? ##

	@Controller
	@RequestMapping("/userOrder")
	public class UserOrderController extends BaseController{
		
		@Autowired	
		private UserOrderService userOrderService

		@RequestMapping(value="/save")
		public void save(PrintWriter out){
			UserOrder uo = new UserOrder();
			uo.setOrderAccount = 3;
			//UserOrderService�̳���BaseService,��UserOrderServiceImpl�̳���BaseServiceImpl
			//BaseService��װ��CommonDao�Ĳ�����������UserOrderService����ֱ�ӱ���UserOrder������
			userOrderService.save(uo);
			result.put("resultCode", 1);
			result.put("resultMsg", "����ɹ�");
			out.write(result.toJSONString());// will improve later
		}
	}

## 6. CommonDao���ṩ����Щ����? ##
	public void save(Object entity);
	
	public void batchSave(List list);
	
	/**
	 * ����id(��ע�� @Id ���� ) ����entity�в�Ϊnull��ֵ
	 * @param entity
	 */
	public void update(Object entity);
	
	public void deleteById(Class<?> clazz ,Object id);
	
	/**
	 * ����id(��ע�� @Id ���� ) ɾ��������
	 * @param entity
	 */
	public void delete(Object entity);
	
	public void deleteByIds(Class<?> clazz, List ids);
	
	public <T> T get(Class<T> clazz,Object id);
	
	/**
	 * ��listByExample��ʽһ���������ص�������
	 * @param vo
	 * @return
	 */
	public Object getByExample(Object vo);
	
	/**
	 * 
	 * Account account = new Account();
	 * account.name="test";
	 * account.pwd = "123456";
	 * �ȼ����ѯ
	 * select * from Account where name='test' and pwd = '123456'
	 * @param vo
	 * @return
	 */
	public <T> List<T> listByExample(Object vo);
	
	/**
	 * ���ݲ�ѯ������ѯ���
	 * @param statement mybatis mapper�ļ��ж���Ĳ�ѯ���id
	 * @param paramMap	��������һ��map
	 * @return ���ؽ����map list.
	 */
	public List<Map> listByParams(String statement , ParamMap paramMap);
	
	/**
	 * ���ݲ�ѯ������ѯ���
	 * @param clazz ���ؽ������װ�ɵ�java�࣬�������ѯʱ���Զ�����࣬�������в�ѯ�����Ҫ���ص��ֶΡ�
	 * @param statement mybatis mapper�ļ��ж���Ĳ�ѯ���id
	 * @param paramMap ��������һ��map
	 * @return �������װ�� ����clazz��ʵ������
	 */
	public <T> List<T> listByParams(Class<T> clazz, String statement, ParamMap paramMap);
	
	/**
	 * ��ҳ��ѯ�������ڵ����ѯ,��Ҫ��mapper.xml�ļ���дsql���
	 */
	public <T> Page<T> findPageByParams(Class<T> clazz , Page<T> page ,String statement , ParamMap paramMap);
	
    /**
	 * �����ҳ��sql��ѯ,����Ҫ��mapper.xml�ļ���дsql���
	 */
	public <T> Page<T> findPage(Class<T> clazz , Page<T> page , ParamMap paramMap);

    /**
	 * ��ҳ��ѯ�������ڹ�����ѯ
	 */
	public Page<Map> findPageByParams(Page<Map> page, String statement , ParamMap paramMap);
	
	//ִ��һ��sql
	public int execute(String statement , ParamMap paramMap);

## 7. ��μ���shiroȨ�޿��? ##
   a.��web.xml��������´���

	<filter>
    	<filter-name>shiroFilter</filter-name>
    	<filter-class>
			org.springframework.web.filter.DelegatingFilterProxy
		</filter-class>
	    <init-param>
	      <param-name>targetFilterLifecycle</param-name>
	      <param-value>true</param-value>
	    </init-param>
  	</filter>
  	<filter-mapping>
	    <filter-name>shiroFilter</filter-name>
	    <url-pattern>/*</url-pattern>
	</filter-mapping>

   b.��spring.xml��������������
	<!-- ================ Shiro start ================ -->
		<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
			<property name="sessionManager" ref="sessionManager" />
			<property name="realm" ref="loRealm" />
		</bean>
    
    <bean id="memoryCacheManager" class="org.apache.shiro.cache.MemoryConstrainedCacheManager"><!-- �Զ���cacheManager -->
    </bean>
    
    <bean id="sessionManager"  class="com.jumore.dove.cluster.MyDefaultWebSessionManager">
		<property name="cacheManager" ref="memoryCacheManager" />
        <property name="sessionIdCookieEnabled" value="true" />
    </bean>
    
	<!-- �Ŀ�Զ����Realm -->
	<bean id="loRealm" class="com.jumore.logisticsOperation.service.permission.LoRealm" >
		<property name="cacheManager" ref="memoryCacheManager" />
	</bean>
	
	<!-- Shiro Filter -->
	<bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
		<property name="securityManager" ref="securityManager" />
		
		<property name="loginUrl" value="/account/login" />
		
		<property name="successUrl" value="/index" />
		
		<property name="unauthorizedUrl" value="/error/403" />
       
		<property name="filterChainDefinitions">
			<value>
			/static/** 				= anon
			/error/** 				= anon
           	/account/login	 		= anon
           	/account/doLogin	 	= anon
           	/**						= authc
			<!--authc��shiro���õ���֤����������������Ҫ��¼-->
			</value>
		</property>
	</bean>
	<!-- ================ Shiro end ================ -->

���ˣ����Կ��� /** autch�������Ҫ�����Ƿ���ÿ��ҳ��ǰҪ����û��Ƿ񾭹���֤����ô�����֤��������������أ�û����������������ǿ����ø� ��Ŀ�Զ���realm�����ǽ�����һ������������������

## 8. ���ʹ��shiro��¼ϵͳ ##
	������controller�У�����Ҫ��ôд
	@RequestMapping(value = "/doLogin")
	public void doLogin(HttpServletResponse response, String username , String password) throws Exception{
		UsernamePasswordToken token = new UsernamePasswordToken(username,password);
		Map<String, Object> map = new HashMap<String, Object>();
		try{
			//�ؼ�������仰,Ȼ��ȥ�����¼���أ��𰸾�����Ŀ�Զ����AuthorizingRealm��
			SecurityUtils.getSubject().login(token);
			map.put("resultCode", 4);
		}catch(Exception ex){
			map.put("resultCode", 0);
			map.put("resultMsg", ex.getCause().getMessage());
		}
		CommWriteResponse.writeResponse(response, JsonUtil.offerJson(map));
	}
	
�����������Զ���AuthorizingRealm������
	public class LoRealm extends AuthorizingRealm {

		@Resource
		private AuthorizationService authorizationService;
		
		@Override
		protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
			SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
			//��sessionȡ�û�
			Account account = (Account) SecurityUtils.getSubject().getSession().getAttribute(Consts.Session_User_Key);
			if("superadmin".equals(account.account)){
				info.addStringPermission("*");
			}
			//��ӽ�ɫ
			List<Role> roles = authorizationService.getRolesOfAccount(account.id);
			for(Role role : roles){
				info.addRole(role.code);
			}
			//���Ȩ��
			List<Menu> menus = authorizationService.getMenusOfAccount(account.id);
			for(Menu menu : menus){
				info.addStringPermission(menu.code);	
			}
			return info;
		}
	
		@Override
		protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
			//SecurityUtils.getSubject().login(token)�����ս����û���Ϣ��֤�ĵط���������
			String username = (String) token.getPrincipal(); // �õ��û���
			String password = new String((char[]) token.getCredentials()); // �õ�����
			if(StringUtils.isEmpty(username) || StringUtils.isEmpty(password)){
				throw new RuntimeException("�û��������벻��Ϊ��");
			}
			Account vo = new Account();
			vo.account = username;
			vo.password = MD5.md5(password);
			Account po = (Account) authorizationService.getByExample(vo);
			if(po!=null){
				//���û���Ϣ���浽����
				SecurityUtils.getSubject().getSession().setAttribute(Consts.Session_User_Key, po);
				return new SimpleAuthenticationInfo(username, password, getName());
			} else {
				throw new RuntimeException("�û��������벻��ȷ");
			}
		}
	}

## 9. ʹ��shiro����˳� ##
	@RequestMapping(value = "/doLogout")
	public String doLogout(HttpServletResponse response) throws Exception{
		SecurityUtils.getSubject().logout();
		//clear session
		SecurityUtils.getSubject().getSession().removeAttribute(Consts.Session_User_Key);
		return "redirect:/account/login";
	}

## 10. velocityҳ�����ʹ��shiro��Ȩ���ж�? ##
	#if($!subject.isPermitted('role_manager'))
    	<li><span class="nav02" data-href="$!ServiceName/role/list">��ɫ����</span></li>
    #end
	����
	#if($!subject.hasRole('admin'))
    	<li><span class="nav02" data-href="$!ServiceName/role/list">��ɫ����</span></li>
    #end
	//subject�������õ�Shiro Subject����

## 11. Ϊʲô�ڼ���shiro��IDEA�����󲻶ϵĴ�session�����ڵ�log? ##
	��ϲ������IDEA��һ���ӣ��޸�һ�����ü���,��ͼ�Ǹ�After launch��Ҫ��ѡ
![file-list](http://yunwei2.com/bbs/upload/2016/6/30/c56bf6df21a94067acabd07fd33cf097_8475.jpg_)
## 12. ����ڲ�ѯ����������? ##
	//����score������
	ParamMap pd = new ParamMap();
	//ע�����score�����ݿ��ֶ�
	//ReflectHelper.getColumnName(User.class,"score");��ȡuser����score�ֶζ�Ӧ�����ݿ��ֶ�
	pd.addOrder("score", "desc");
	dao.listByParams("PurchaseMapper.list", pd);

## 13. ���ʹ�û���? ##
### 13.1 ʹ�÷���һ(�ڷ����ϼ�annotation):
	@Cached( cacheTime=3600,toJVM = true)
	public DevSimpleObject invokeObj(int id,String name)
	{
	    logger.info("DevSampleServiceImpl.invokeObj create obj. " + id + " " + name);
	    DevSimpleObject dt = new DevSimpleObject();
	    dt.setId(id);
	    dt.setName(name);
	    return dt;
	}
### 13.2 Cached Annotation ��ϸ����
	public @interface Cached {
    	String objType() default ""; // Ĭ��Ϊ�� ,�� ����.����.������ ��Ϊ �������
    	boolean toJVM() default false; // Ĭ��Ϊ��
    	int cacheTime() default 3600; // Ĭ�� 1��Сʱ,��λ�룬����ʧЧʱ��
	}
### 13.3 ObjType��ID
���ڼ���ʽ�����еĶ�����Key-Value����ʽ�洢������

	Key=ObjType + Id
	//objType:��ʶ��������
	//Id:���ֶ���ʵ�� 

### 13.4 ʹ�÷�����(��Spring�л�ȡcacheService com.jumore.dove.cache.CacheService ):ֱ��ʹ��CacheService�ӿ�
	public interface CacheService {
	    // com.jumore.dove.cache.user + key(user id)
	    //public <T>T get(Class<T> cls, String objType,String id,Callable callable,int expireTime);
	    public String getString(String objType,String id,Callable<String> callable,int expireTime);
	    public String getString(String objType,String id);
	    public byte[] getData(String objType,String id,Callable<byte[]> callable,int expireTime);
	    public byte[] getData(String objType,String id);
	    public <T>T getObject(Class<T> cls, String objType,String id,Callable<T> callable,int expireTime);
	    public <T>T getObject(Class<T> cls, String objType,String id);
	    public void set(String objType,String id,Object obj,int expireTime);
	    public void del(String objType,String id );
	}

### 13.5 ɾ�������û���
ʹ��com.jumore.dove.cache.Cache �õ�@cached������ObjType��id

	//ͨ�����ò����ȵ�CacheID     
	public static String getCacheId(Object[] args)  
	//�õ���������     
	public static String getObjectType(Class cls,String methodName)
����CacheService����Ӧ�ķ���

	public void set(String objType,String id,Object obj,int expireTime);
	public void del(String objType,String id );

## 14 ���ʵ�ַ���
	
### 14.1 ���񻯽ӿڶ���
	//this is a demo service interface
	public interface UserServiceRemote extends SOARemote {
    	User getUserById(int id);
	}
### 14.2 ���񻯽ӿ�ʵ��
	@Service
	public class SOADemoUserService implements UserServiceRemote {
	    private static Logger logger = LoggerFactory.getLogger(SOADemoUserService.class);
	    public User getUserById(int id) {
	    }
	}
### 14.3 ����Զ�̽ӿ�
	//Spring ע��
	@Autowired
	SOAService soaService;
	public String demoRemote(int userId){
	    try {
	        UserServiceRemote userServiceRemote = soaService.getRemoteService(UserServiceRemote.class);
	        User user = userServiceRemote.getUserById(userId);
	        return user.toString();
	    }catch(Exception ex){
	        logger.error("demoRemote",ex);
	        return "error:" + ex.getMessage();
	    }
	}
	
## 15 ��Ϣ���е�ʹ��
### 15.1 ������Ϣ��queue
    MQManager mqManager = MQManagerFactory.getMQManager();
    
    @Autowired
    private MessageSender sender;
    //������Ϣȷ�ϻص�����
    sender.setConfirmCallback(callback);
    //����һ��queue,����ǰҪ����queue����
    mqManager.declareQueue("queueName", true);
    sender.send("string message" , "msgId" , "queueName");
    //���͸��Ӷ���
    sender.send(obj,"msgId" , "queueName");
### 15.2 ������Ϣ��topic
    MQManager mqManager = MQManagerFactory.getMQManager();
    
    @Autowired
    private MessageSender sender;
    
    //������Ϣȷ�ϻص�����
    sender.setConfirmCallback(callback);
    //����һ��topic,������Ҫ��֤topic����
    MQManagerFactory.getMQManager().declareTopic("topicName", true);
    sender.publish("string message" , "msgId" , "topic");
    //���͸��Ӷ���
    sender.publish(obj,"msgId" , "queueName");
### 15.3 ���Ѷ����е���Ϣ
    //Spring ע��
    @Autowired
    private MessageConsumerManager messageConsumerManager;
    
    //���һ����������������Ϊsms��queue,һ��queue������Ӷ��������
    messageConsumerManager.start(new MessageReceiverAdapter("sms") {
        public void onMessage(Object msg) {
            System.out.println("receive message from queue,content = "+msg);
            //���쳣Ӧ���׳���MessageConsumerManager����catch��������Ӧ����
        }
    });
    
    //���һ������Ϊc1�������ߣ�����reg_success����Ϣ��������Ӷ�������߶���
    //reg_success
    messageConsumerManager.start(new MessageReceiverAdapter("c1","reg_success") {
        public void onMessage(Object msg) {
            System.out.println("receive message from topic ,content = "+msg);
        }
    });
### 15.4 ��Ϣȷ�ϻ���ConfirmCallback
    //������Ϣ(��Ϣû�гɹ����͵�������)�Ļص�
    public interface ConfirmCallback {
        /**
         * �ص�����ͨ��messageId��replyCode����ҵ��ϵͳ����״̬
         * @param replyCode ack:�ɹ�, nack:ʧ��
         */
        public void handleReturn(String replyCode, String replyText, String messageId) throws IOException;
    }
## 16 ʹ������API
### 16.1 spring�����ļ��м���

    <bean id="searchService" class="com.jumore.dove.common.search.impl.DefaultJSearch" />
properties�ļ��м���
    
    searchServers=192.168.1.50:9300
    esClusterName=es-local
    esIndex=dove-demo
### 16.2 ��������

    /**
     * ����sql��������,ʹ����elasticsearch-sql��� ��     �﷨���https://github.com/NLPchina/elasticsearch-sql
     * @param sql
     * @param page
     * @return
     */
    public Page find(String sql, Page page) ;
### 16.3 ������ݵ���������

    /**
     * ��������
     * @param index
     * @param type
     * @param text ������json��ʽ��
     * @param statisticFields ��Ҫͳ�Ƶ��ֶ�
     */
    public void indexing(String type ,String id, String text , List<String> statisticFields);
### 16.4 ɾ������

    /**
     * ����idɾ����¼
     * @param type
     * @param id
     * @param statisticFields ��Ҫͳ�Ƶ��ֶ�
     * @return
     */
    public boolean deleteDoc(String type , String id , List<String> statisticFields);
    
## 17 ��־��ʹ��
    add,update,delete,other��ö����OperationType�ж���
    ʵ������
    /**
     * 
     * ��¼������������Ҫ��¼���������ݶ���
     *      OperationLogBuilder.get(OperationType.add)
     *          .set(OperationLogParam.userId, 123L).set(OperationLogParam.beizhu, "add a new entity").set(OperationLogParam.newData, vo).save();
     * 
     * ��¼ɾ������,��Ҫ��¼ɾ�������ݶ���
     *      OperationLogBuilder.get(OperationType.delete)
     *          .set(OperationLogParam.userId, 123L).set(OperationLogParam.beizhu, "delete a entity").set(OperationLogParam.oldData, po).save();
     * 
     * ��¼���²���,��Ҫ��¼����ǰ�͸��º�����ݶ��󣬷������Զ���¼����
     *      Purchase po = service.get(Purchase.class, id);
     *      Purchase old = (Purchase)BeanUtils.cloneBean(po);
     *      po.address="update address4";
     *      po.tel="aaabb";
     *      service.update(po);
     *      OperationLogBuilder.get(OperationType.update)
                .set(OperationLogParam.userId, 123L).set(OperationLogParam.beizhu, "update entity")
                .set(OperationLogParam.oldData, old).set(OperationLogParam.newData, po).save();
     * @author yexinzhou
     *
     */
## 18 log��ʹ��
    //����
    protected final LogHelper logHelper = LogHelper.getLogger(this.getClass());
    //ʵ��,ע�� logHelper.getBuilder()Ϊ�����
    logHelper.getBuilder().tag("username", "yexinzhou").tag("action", "login").info("user logger in.");

## 19 �Ƿ��ַ���У��

## 20 ͳ�ƹ��ܵ�ʹ��
    ʹ��ע��@Statistics��ʵ�ַ��ʵĴ����ͷ��ʺ�ʱ��ͳ��,ע��@Statistics���Լ���Method , Class , Package���������ϡ�
    ���@NoStatisticsע����Ժܺõ�ʵ�ָ�����������
## 20 ����ʵ����
