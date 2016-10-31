## Dove框架使用指南 ##

[TOC]

## 1. 什么是dove框架? ##

	dove提供了包括Dao ,BaseService封装， Cache , 消息中间件，短信服务，监控(陆续增加)等各种公用功能的工程

## 2. 如何引入dove框架? ##
	<dependency> 
   		<groupId>com.jumore</groupId>
      	<artifactId>dove</artifactId>
		<!--具体版本号联系架构组-->
      	<version>1.5.0-SNAPSHOT</version>
 	</dependency>

在你的spring配置文件中加入以下配置

	<import resource="classpath:dove/dove-*.xml"/>
	<!--也可以根据需要分别引入
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
        <!-- mapper扫描 -->
        <property name="mapperLocations" value="classpath:mybatis/mapper/*/*.xml"></property>
    </bean>

加入dove.properties文件,在classpath下新建config/dove.properties文件,在文件中加入以下配置(开发环境)

	#所有的配置不使用的不要删除，可以将相应的模块设置enable=false    
	
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


## 3. 如何添加一个dao? ##
	业务代码不需要增加自己的DAO,记住这一条就可以了,dove dao提供了一个通用实现

## 3. 如何添加一个service? ##

	public interface UserOrderService extends BaseService{
		public void youBizService();
	} 

	public class UserOrderServiceImpl extends BaseServiceImpl implements UserOrderService{
		public void youBizService(){
		}
	}
	以上是一个典型的业务系统中定义自己的Service代码，当然你需要将UserOrderServiceImpl配置成一个spring bean.


## 4. 如何定义一个实体类? ##

	@Entity //标注这是一个实体类，dove dao的save/update方法会检查此注解，没有这个注解的对象不会保存到数据库
	@Table(name="user_order");//定义了实体类对应的数据库表名称，默认可以不加此注解，那么dove dao默认将类名当做表名
	public class UserOrder{
		@Id //此注解标注了一个主键字段，每一个实体类都是必须的，也应该有一个逻辑主键
		@AutoIncrease //表明主键由数据库自增产生，不是必须的注解，如果不加，那么就要在save之前，通过代码为uid赋值
		@Sequence //此注解表示主键生成方式是由数据库序列产生,和@AutoIncrease只需要一个即可，如果两个注解都有，以@AutoIncrease优先
		private Long uid;

		@Column(name="orde_account"); // 定义了数据库对应的字段，不是必须，默认dove dao以实体类的字段名作为数据库字段名使用
		private Integer orderCount;

		//...setter/getter...//
	}
自此，我们已经定义了一个可用的实体类了，让我们进行下一步

## 5. 如何添加一个controller? ##

	@Controller
	@RequestMapping("/userOrder")
	public class UserOrderController extends BaseController{
		
		@Autowired	
		private UserOrderService userOrderService

		@RequestMapping(value="/save")
		public void save(PrintWriter out){
			UserOrder uo = new UserOrder();
			uo.setOrderAccount = 3;
			//UserOrderService继承了BaseService,而UserOrderServiceImpl继承了BaseServiceImpl
			//BaseService封装了CommonDao的操作，因此你的UserOrderService可以直接保存UserOrder对象了
			userOrderService.save(uo);
			result.put("resultCode", 1);
			result.put("resultMsg", "保存成功");
			out.write(result.toJSONString());// will improve later
		}
	}

## 6. CommonDao中提供了哪些方法? ##
	public void save(Object entity);
	
	public void batchSave(List list);
	
	/**
	 * 根据id(由注解 @Id 决定 ) 更新entity中不为null的值
	 * @param entity
	 */
	public void update(Object entity);
	
	public void deleteById(Class<?> clazz ,Object id);
	
	/**
	 * 根据id(由注解 @Id 决定 ) 删除表数据
	 * @param entity
	 */
	public void delete(Object entity);
	
	public void deleteByIds(Class<?> clazz, List ids);
	
	public <T> T get(Class<T> clazz,Object id);
	
	/**
	 * 与listByExample方式一样，单返回单条数据
	 * @param vo
	 * @return
	 */
	public Object getByExample(Object vo);
	
	/**
	 * 
	 * Account account = new Account();
	 * account.name="test";
	 * account.pwd = "123456";
	 * 等价与查询
	 * select * from Account where name='test' and pwd = '123456'
	 * @param vo
	 * @return
	 */
	public <T> List<T> listByExample(Object vo);
	
	/**
	 * 根据查询条件查询结果
	 * @param statement mybatis mapper文件中定义的查询语句id
	 * @param paramMap	参数，是一个map
	 * @return 返回结果是map list.
	 */
	public List<Map> listByParams(String statement , ParamMap paramMap);
	
	/**
	 * 根据查询条件查询结果
	 * @param clazz 返回结果被封装成的java类，在联表查询时可以定义个类，包含所有查询语句需要返回的字段。
	 * @param statement mybatis mapper文件中定义的查询语句id
	 * @param paramMap 参数，是一个map
	 * @return 结果被封装成 参数clazz的实例集合
	 */
	public <T> List<T> listByParams(Class<T> clazz, String statement, ParamMap paramMap);
	
	/**
	 * 分页查询，多用于单表查询,需要在mapper.xml文件中写sql语句
	 */
	public <T> Page<T> findPageByParams(Class<T> clazz , Page<T> page ,String statement , ParamMap paramMap);

    /**
	 * 分页查询，多用于关联查询
	 */
	public Page<Map> findPageByParams(Page<Map> page, String statement , ParamMap paramMap);
	
	//执行一个sql
	public int execute(String statement , ParamMap paramMap);

## 7. 如何集成shiro权限框架? ##
   a.在web.xml中添加如下代码

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

   b.在spring.xml中增加以下配置
	<!-- ================ Shiro start ================ -->
		<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
			<property name="sessionManager" ref="sessionManager" />
			<property name="realm" ref="loRealm" />
		</bean>
    
    <bean id="memoryCacheManager" class="org.apache.shiro.cache.MemoryConstrainedCacheManager"><!-- 自定义cacheManager -->
    </bean>
    
    <bean id="sessionManager"  class="com.jumore.dove.cluster.MyDefaultWebSessionManager">
		<property name="cacheManager" ref="memoryCacheManager" />
        <property name="sessionIdCookieEnabled" value="true" />
    </bean>
    
	<!-- 項目自定义的Realm -->
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
			<!--authc是shiro内置的认证过滤器，简单理解就是要登录-->
			</value>
		</property>
	</bean>
	<!-- ================ Shiro end ================ -->

好了，可以看到 /** autch这个配置要求我们访问每个页面前要检查用户是否经过认证，那么这个认证过程在哪里进行呢，没错就是在配置中我们看到拿个 项目自定义realm。我们将在下一个问题中来具体描述

## 8. 如何使用shiro登录系统 ##
	首先在controller中，你需要这么写
	@RequestMapping(value = "/doLogin")
	public void doLogin(HttpServletResponse response, String username , String password) throws Exception{
		UsernamePasswordToken token = new UsernamePasswordToken(username,password);
		Map<String, Object> map = new HashMap<String, Object>();
		try{
			//关键就是这句话,然后去哪里登录了呢，答案就在项目自定义的AuthorizingRealm中
			SecurityUtils.getSubject().login(token);
			map.put("resultCode", 4);
		}catch(Exception ex){
			map.put("resultCode", 0);
			map.put("resultMsg", ex.getCause().getMessage());
		}
		CommWriteResponse.writeResponse(response, JsonUtil.offerJson(map));
	}
	
下面来看看自定义AuthorizingRealm的例子
	public class LoRealm extends AuthorizingRealm {

		@Resource
		private AuthorizationService authorizationService;
		
		@Override
		protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
			SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
			//从session取用户
			Account account = (Account) SecurityUtils.getSubject().getSession().getAttribute(Consts.Session_User_Key);
			if("superadmin".equals(account.account)){
				info.addStringPermission("*");
			}
			//添加角色
			List<Role> roles = authorizationService.getRolesOfAccount(account.id);
			for(Role role : roles){
				info.addRole(role.code);
			}
			//添加权限
			List<Menu> menus = authorizationService.getMenusOfAccount(account.id);
			for(Menu menu : menus){
				info.addStringPermission(menu.code);	
			}
			return info;
		}
	
		@Override
		protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
			//SecurityUtils.getSubject().login(token)后，最终进行用户信息验证的地方就在这里
			String username = (String) token.getPrincipal(); // 得到用户名
			String password = new String((char[]) token.getCredentials()); // 得到密码
			if(StringUtils.isEmpty(username) || StringUtils.isEmpty(password)){
				throw new RuntimeException("用户名或密码不能为空");
			}
			Account vo = new Account();
			vo.account = username;
			vo.password = MD5.md5(password);
			Account po = (Account) authorizationService.getByExample(vo);
			if(po!=null){
				//将用户信息保存到缓存
				SecurityUtils.getSubject().getSession().setAttribute(Consts.Session_User_Key, po);
				return new SimpleAuthenticationInfo(username, password, getName());
			} else {
				throw new RuntimeException("用户名或密码不正确");
			}
		}
	}

## 9. 使用shiro如何退出 ##
	@RequestMapping(value = "/doLogout")
	public String doLogout(HttpServletResponse response) throws Exception{
		SecurityUtils.getSubject().logout();
		//clear session
		SecurityUtils.getSubject().getSession().removeAttribute(Consts.Session_User_Key);
		return "redirect:/account/login";
	}

## 10. velocity页面如何使用shiro做权限判断? ##
	#if($!subject.isPermitted('role_manager'))
    	<li><span class="nav02" data-href="$!ServiceName/role/list">角色管理</span></li>
    #end
	或者
	#if($!subject.hasRole('admin'))
    	<li><span class="nav02" data-href="$!ServiceName/role/list">角色管理</span></li>
    #end
	//subject或框架内置的Shiro Subject对象

## 11. 为什么在集成shiro后，IDEA启动后不断的打session不存在的log? ##
	恭喜你中了IDEA的一个坑，修改一下配置即可,下图那个After launch不要勾选
![file-list](http://yunwei2.com/bbs/upload/2016/6/30/c56bf6df21a94067acabd07fd33cf097_8475.jpg_)
## 12. 如何在查询中增加排序? ##
	//根据score倒排序
	ParamMap pd = new ParamMap();
	//注意这个score是数据库字段
	//ReflectHelper.getColumnName(User.class,"score");获取user类中score字段对应的数据库字段
	pd.addOrder("score", "desc");
	dao.listByParams("PurchaseMapper.list", pd);

## 13. 如何使用缓存? ##

### 13.1 使用方法(在Spring中获取cacheService com.jumore.dove.cache.CacheService ):直接使用CacheService接口
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

### 13.2 删除和设置缓存
使用com.jumore.dove.cache.Cache 得到@cached产生的ObjType和id

	//通过调用参数等到CacheID     
	public static String getCacheId(Object[] args)  
	//得到对象类型     
	public static String getObjectType(Class cls,String methodName)
调用CacheService中相应的方法

	public void set(String objType,String id,Object obj,int expireTime);
	public void del(String objType,String id );

## 14 如何实现服务化
	
### 14.1 服务化接口定义
	//this is a demo service interface
	public interface UserServiceRemote extends SOARemote {
    	User getUserById(int id);
	}
### 14.2 服务化接口实现
	@Service
	public class SOADemoUserService implements UserServiceRemote {
	    private static Logger logger = LoggerFactory.getLogger(SOADemoUserService.class);
	    public User getUserById(int id) {
	    }
	}
### 14.3 访问远程接口
	//Spring 注入
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
	
## 15 消息队列的使用
### 15.1 发送消息到queue
    MQManager mqManager = MQManagerFactory.getMQManager();
    
    @Autowired
    private MessageSender sender;
    //设置消息确认回调方法
    sender.setConfirmCallback(callback);
    //创建一个queue,发送前要保存queue存在
    mqManager.declareQueue("queueName", true);
    sender.send("string message" , "msgId" , "queueName");
    //发送复杂对象
    sender.send(obj,"msgId" , "queueName");
### 15.2 发布消息到topic
    MQManager mqManager = MQManagerFactory.getMQManager();
    
    @Autowired
    private MessageSender sender;
    
    //设置消息确认回调方法
    sender.setConfirmCallback(callback);
    //创建一个topic,发送者要保证topic存在
    MQManagerFactory.getMQManager().declareTopic("topicName", true);
    sender.publish("string message" , "msgId" , "topic");
    //发送复杂对象
    sender.publish(obj,"msgId" , "queueName");
### 15.3 消费队列中的消息
    //Spring 注入
    @Autowired
    private MessageConsumerManager messageConsumerManager;
    
    //添加一个消费者消费名称为sms的queue,一个queue可以添加多个消费者
    messageConsumerManager.start(new MessageReceiverAdapter("sms") {
        public void onMessage(Object msg) {
            System.out.println("receive message from queue,content = "+msg);
            //有异常应该抛出，MessageConsumerManager负责catch，并做相应处理
        }
    });
    
    //添加一个名称为c1的消费者，订阅reg_success的消息。可以添加多个消费者订阅
    //reg_success
    messageConsumerManager.start(new MessageReceiverAdapter("c1","reg_success") {
        public void onMessage(Object msg) {
            System.out.println("receive message from topic ,content = "+msg);
        }
    });
### 15.4 消息确认机制ConfirmCallback
    //发送消息(消息没有成功发送到队列上)的回调
    public interface ConfirmCallback {
        /**
         * 回调处理，通过messageId和replyCode处理业务系统数据状态
         * @param replyCode ack:成功, nack:失败
         */
        public void handleReturn(String replyCode, String replyText, String messageId) throws IOException;
    }
## 16 使用搜索API
### 16.1 spring配置文件中加入

    <bean id="searchService" class="com.jumore.dove.common.search.impl.DefaultJSearch" />
properties文件中加入
    
    searchServers=192.168.1.50:9300
    esClusterName=es-local
    esIndex=dove-demo
### 16.2 搜索数据

    /**
     * 根据sql搜索数据,使用了elasticsearch-sql插件 ，     语法详见https://github.com/NLPchina/elasticsearch-sql
     * @param sql
     * @param page
     * @return
     */
    public Page find(String sql, Page page) ;
### 16.3 添加数据到搜索引擎

    /**
     * 索引数据
     * @param index
     * @param type
     * @param text 必须是json格式的
     * @param statisticFields 需要统计的字段
     */
    public void indexing(String type ,String id, String text , List<String> statisticFields);
### 16.4 删除数据

    /**
     * 根据id删除记录
     * @param type
     * @param id
     * @param statisticFields 需要统计的字段
     * @return
     */
    public boolean deleteDoc(String type , String id , List<String> statisticFields);
    
## 17 日志的使用
    add,update,delete,other在枚举类OperationType中定义
    实例代码
    /**
     * 
     * 记录新增操作，需要记录新增的数据对象
     *      OperationLogBuilder.get(OperationType.add)
     *          .set(OperationLogParam.userId, 123L).set(OperationLogParam.beizhu, "add a new entity").set(OperationLogParam.newData, vo).save();
     * 
     * 记录删除操作,需要记录删除的数据对象
     *      OperationLogBuilder.get(OperationType.delete)
     *          .set(OperationLogParam.userId, 123L).set(OperationLogParam.beizhu, "delete a entity").set(OperationLogParam.oldData, po).save();
     * 
     * 记录更新操作,需要记录更新前和更新后的数据对象，方法会自动记录差异
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
## 18 log的使用
    //引入
    protected final LogHelper logHelper = LogHelper.getLogger(this.getClass());
    //实例,注意 logHelper.getBuilder()为必须的
    logHelper.getBuilder().tag("username", "yexinzhou").tag("action", "login").info("user logger in.");

## 19 非法字符的校验
    当存在非法字符（html转义字符）时，抛出BusinessException异常
    
    1、HTTP请求的Parameter参数非法字符校验
    配置spring拦截器即可，示例：
	<!-- 拦截器配置 -->
	   <mvc:interceptors>  
	   <!-- 非法字符拦截器 -->
		<mvc:interceptor>         
		<mvc:mapping path="/**"/> 
		<!-- 静态资源 -->
		<mvc:exclude-mapping path="/page/**"/>
		<mvc:exclude-mapping path="/assets/**"/>
		<!-- 其它不进行转义字符判断的URL -->
		<mvc:exclude-mapping path="/config/**"/>      
		<bean class="com.jumore.dove.aop.interceptor.IllegalCharInterceptor"/>    
		</mvc:interceptor>  
	    </mvc:interceptors>
    
    2、HTTP请求(Content-Type=application/json)，body正文非法字符校验
    在web.xml中配置过滤器，以tomcat配置为例：
    <!-- json请求body体非法字符判断 -->
    <filter>
	<filter-name>illegalCharBodyFilter</filter-name>
	<filter-class>com.jumore.dove.web.filter.IllegalCharBodyFilter</filter-class>
	</filter>
	<filter-mapping>
	<filter-name>illegalCharBodyFilter</filter-name>
	<url-pattern>/*</url-pattern>
    </filter-mapping>

## 20 统计功能的使用
    使用注解@Statistics来实现访问的次数和访问耗时的统计,注解@Statistics可以加在Method , Class , Package三个级别上。
    配合@NoStatistics注解(从统计中个别排除)可以很好的实现各种灵活的配置
    
    Class级别的注解例:
    
    @Statistic
    public class CommonDaoImpl implements CommonDao {

    统计信息是通过打印一条特殊的log实现的（log的Marker为statistics）。如果不希望这条log出现在console或者文件的日志中，
    需要在logback的配置文件中增加filter（NoStatisticsLogFilter）。
    
    配置例：
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <Target>System.out</Target>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss}[%t]%-5p %c{36}.%M\(%L\) %m%n</pattern>
        </encoder>
        <filter class="com.jumore.dove.common.log.NoStatisticsLogFilter" />
    </appender>
    
    统计日志会被记入到ElasticSearch的 应用名_statistics_kafka_index 索引中。（应用名是在 FlumeAppender中配置的）
    在kibana上针对这个index，可以图形化的方式查看统计信息。
    
## 21 生成实体类
    [https://github.com/jm-team/dove-doc/blob/master/mybatis-generator-core-1.3.3.jar](https://github.com/jm-team/dove-doc/blob/master/mybatis-generator-core-1.3.3.jar "实体类生成工具")
## 21 异步方法
	框架内置了google的EventBus,使用时直接使用spring bean注入的方式使用

### 21.1生产者
	@Autowired
	private AsyncEventBus asyncEBus
	.......
	asyncEBus.post(news);
### 21.2消费者
	@AsynEventSubscriber
	public class NewsReceiver{
		@Subscribe
		public void one(News news){
			...		
		}
	}
	
## 22 任务 ElasticJob的使用
	Dove中封装了ElasticJob来提供定时任务的能力。
	通过以下步骤，编写一个定时任务。
	1. 编写一个任务类，继承com.jumore.dove.schedule.simple.SimpleScheduleTask类。
	2. 为此类增加SimpleScheduled注解。此注解有两个属性，cron为同crontab的执行时间格式，description为此任务的描述。
	3. 实现public void process(JobExecutionMultipleShardingContext shardingContext)方法，在这里编写实际的任务代码。
	4. 为此类增加@Component等Spring标签，并配置使得Spring可以扫描到此类，这样就会被管理，按照cron设置的时间被执行。
	
	示例：
	
	@Component
	@SimpleScheduled(cron = "0/30 * * * * ?", description = "demo定时任务")
	public class DemoScheduledJob extends SimpleScheduleTask {

	@Resource
	private DemoService demoService;
	
	@Override
	public void process(JobExecutionMultipleShardingContext shardingContext) {
			// 在这里编写你的任务代码
			demoService.doSomething();
		}
	}
